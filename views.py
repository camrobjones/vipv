"""
Views for VIPV
-----

"""
import os
import json
import requests
import xml.etree.ElementTree as ET
from urllib.parse import urlencode
import random

import pandas as pd
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.utils import timezone as tz
from django.conf import settings
from django.contrib.auth.decorators import user_passes_test
from sklearn.model_selection import train_test_split

from vipv.models import (Participant, Rating, BinaryChoice)
from vipv.secrets import SONA_EXPT_ID, SONA_CREDIT_TOKEN
from vipv.data.words import wordlist

"""
Parameters
----------
"""

# General parameters
MODULE_NAME = "vipv"
RESULTS_DIR = MODULE_NAME + '/data/results/'  # Store responses

RECAPTCHA_URL = "https://www.google.com/recaptcha/api/siteverify"
SONA_URL = "https://ucsd.sona-systems.com/services/SonaAPI.svc/WebstudyCredit"

MODELS = {
    "participant": Participant,
    "rating": Rating,
    "binary": BinaryChoice,
}


"""
Load Data
---------
Helper functions to load and reformat data.
"""


def load_irq(limit=None):
    """Load the IRQ rating statements.

    Note: limiting will not guarantee catch q's are sampled
    """
    df = pd.read_csv("vipv/data/irq.csv")  # Load
    df = df.sample(frac=1)  # Randomly shuffle
    df = df[:limit]  # Limit
    items = df.to_dict(orient="records")  # Convert to JSON-style record dict

    return items


def generate_blocks(df, limit=None):
    """Generate pv data blocks."""
    crits = df[df["item_type"] == "critical"]
    fillers = df[df["item_type"] == "filler"]

    # Split criticals
    crit_class_labels = crits.pv_modality + crits.wm_modality + crits.wm_load.astype(str) + \
                        crits.correct_response_pv.astype(str) + crits.correct_response_wm
    block_1_crit, block_2_3_crit = train_test_split(crits, train_size=24, stratify=crit_class_labels)

    crit_class_labels_2_3 = block_2_3_crit.pv_modality + block_2_3_crit.wm_modality + block_2_3_crit.wm_load.astype(str) + \
                       block_2_3_crit.correct_response_pv.astype(str) + block_2_3_crit.correct_response_wm
    block_2_crit, block_3_crit = train_test_split(block_2_3_crit, test_size=0.5, stratify=crit_class_labels_2_3)
    
    # Split fillers
    filler_class_labels = fillers.wm_modality + fillers.wm_load.astype(str) + \
                        fillers.correct_response_pv.astype(str) + fillers.correct_response_wm
    block_1_filler, block_2_3_filler = train_test_split(fillers, test_size=0.67, stratify=filler_class_labels)

    filler_class_labels_2_3 = block_2_3_filler.wm_modality + block_2_3_filler.correct_response_pv.astype(str) + block_2_3_filler.correct_response_wm
    block_2_filler, block_3_filler = train_test_split(block_2_3_filler, test_size=0.5, stratify=filler_class_labels_2_3)

    block_limit = None if limit is None else int(limit / 3)

    # Combine crits & fillers
    block_1 = pd.concat([block_1_crit, block_1_filler]).sample(frac=1)[:block_limit].reset_index(drop=True)
    block_2 = pd.concat([block_2_crit, block_2_filler]).sample(frac=1)[:block_limit].reset_index(drop=True)
    block_3 = pd.concat([block_3_crit, block_3_filler]).sample(frac=1)[:block_limit].reset_index(drop=True)

    # Add practice to block 1
    practice = pd.read_csv(f"vipv/data/stimuli_vermeulen_practice.csv").fillna("")
    block_1 = pd.concat([practice, block_1])
    
    # Add block ids
    block_1["block_id"] = 1
    block_2["block_id"] = 2
    block_3["block_id"] = 3

    # Add trial ids
    block_1["trial_id"] = "1_" + pd.Series(range(len(block_1))).astype(str)
    block_2["trial_id"] = "2_" + pd.Series(range(len(block_2))).astype(str)
    block_3["trial_id"] = "3_" + pd.Series(range(len(block_3))).astype(str)

    # Checks
    # block_1.groupby(["item_type", "pv_modality", "wm_modality", "wm_load"]).count()
    # block_2.groupby(["item_type", "pv_modality", "wm_modality", "wm_load"]).count()
    # block_3.groupby(["item_type", "pv_modality", "wm_modality", "wm_load"]).count()

    # block_1.groupby(["correct_response_pv", "correct_response_wm"]).count()
    # block_2.groupby(["correct_response_pv", "correct_response_wm"]).count()
    # block_3.groupby(["correct_response_pv", "correct_response_wm"]).count()
    
    blocks = [
        {"block_id": 1, "items": block_1.to_dict(orient="records")},
        {"block_id": 2, "items": block_2.to_dict(orient="records")},
        {"block_id": 3, "items": block_3.to_dict(orient="records")},
    ]

    return blocks

def load_pv_data(list_no=None, limit=None):
    """Load the property verification data."""
    fp = f"vipv/data/stimuli_vermeulen_list_{list_no}.csv"
    df = pd.read_csv(fp)  # Load
    df.fillna("", inplace=True)

    blocks = generate_blocks(df, limit=limit)

    return blocks


def load_task_data(irq_limit=None, pv_limit=None, list_no=None):
    """Load stimuli for all tasks.

    Don't include a task if limit == 0
    """
    stimuli = {}

    # IRQ
    if irq_limit is None or irq_limit > 0:
        stimuli["irq"] = load_irq(limit=irq_limit)

    if pv_limit is None or pv_limit > 0:
        stimuli["pv"] = load_pv_data(limit=pv_limit, list_no=list_no)

    return stimuli


"""
Store Data
----------
"""


def save_json_results(data):
    """Save raw json results as a backup in case something goes wrong..."""
    # Generate filename
    timestamp = tz.now().strftime("%Y-%m-%d-%H-%M-%S")
    ppt_id = data.get('ppt_id')
    filename = f"{timestamp}-{ppt_id}.json"
    filepath = os.path.join(RESULTS_DIR, filename)

    # Ensure RESULTS_DIR exists
    if not os.path.isdir(RESULTS_DIR):
        os.mkdir(RESULTS_DIR)

    # Write file
    with open(filepath, 'w') as file:
        json.dump(data, file, indent=4)

    return True


def store_rating_results(data, ppt):
    """Store results from rating trials."""
    trials = [item for item in data
              if item.get('task') in ["irq"]]

    for trial_data in trials:

        rating = Rating.objects.create(
            # Scale & ppt
            participant=ppt,
            scale=trial_data.get('scale'),

            # Item identifier
            item=trial_data.get('item'),
            item_id=trial_data.get('item_id'),
            item_type=trial_data.get('item_type'),
            version=trial_data.get('version', ""),
            condition=trial_data.get('condition', ""),
            trial_index=trial_data.get('trial_index'),

            # Response info
            response=trial_data.get('response'),
            reaction_time=trial_data.get('rt')
        )

        rating.save()


def store_pv_results(data, ppt):
    """Store results from rating trials."""
    trials = [item for item in data
              if item.get('task') == "PV" and
              item.get('trial_part') == "trial"]

    for trial_data in trials:

        rating = BinaryChoice.objects.create(
            # Task & ppt
            participant=ppt,
            task=trial_data.get('task'),

            # Item identifier
            item=trial_data.get('item'),
            item_id=trial_data.get('item_id'),
            block_id=trial_data.get('block_id'),
            trial_id=trial_data.get('trial_id'),
            item_type=trial_data.get('item_type'),
            condition=trial_data.get('condition'),
            version=trial_data.get('version', ""),

            trial_index=trial_data.get('trial_index'),

            # Response info
            key_press=trial_data.get('response'),
            response=trial_data.get('response_hr'),
            correct_response=trial_data.get('correct_response_pv'),
            is_correct=trial_data.get('is_correct'),
            reaction_time=trial_data.get('rt')
        )

        rating.save()


def store_demographics(data, ppt):
    """Store demographics information."""
    demo = [item for item in data if item.get('trial_part') == "demographics"]

    demo = demo[0]
    print(demo)
    demo_data = demo.get('response', "{}")
    ppt.birth_year = demo_data.get('demographics_year') or None
    ppt.gender = demo_data.get('demographics_gender')
    ppt.handedness = demo_data.get('demographics_handedness')
    ppt.dyslexia = demo_data.get('dyslexia') == "true"
    ppt.adhd = demo_data.get('adhd') == "true"
    ppt.asd = demo_data.get('asd') == "true"
    ppt.vision = demo_data.get('demographics_vision')
    ppt.vision_reason = demo_data.get('demographics_vision_reason')
    ppt.native_english = demo_data.get('demographics_english') == "yes"

    ppt.save()


def check_credit_granted(sona_response):
    """Parse SONA XML response and check if credit granted."""
    sona = "http://schemas.datacontract.org/2004/07/emsdotnet.sonasystems"
    namespace = {"sona": sona}

    try:
        root = ET.fromstring(sona_response)
        result = root[0].find("sona:Result", namespace)
        credit_granted = result.find("sona:credit_status", namespace).text
        if credit_granted == "G":
            return True

    except:
        pass

    return False


def store_debrief(data, ppt):
    """Store debrief information."""
    debrief = filter(lambda x: x.get('trial_part') == "post_test", data)

    for debrief_item in debrief:
        debrief_data = debrief_item.get('response', "{}")
        for name, response in debrief_data.items():
            setattr(ppt, name, response)

    ppt.save()


def save_results(request):
    """Save results to db."""
    # Get posted data
    post = json.loads(request.body.decode('utf-8'))

    # Save raw json
    save_json_results(post)

    # Retreieve ppt
    ppt_id = post.get('ppt_id')
    ppt = Participant.objects.get(pk=ppt_id)

    # store results
    data = post['results']
    store_rating_results(data, ppt)
    store_demographics(data, ppt)
    # store_subject_code(data, ppt)
    store_pv_results(data, ppt)
    store_debrief(data, ppt)

    ppt.end_time = tz.now()

    if ppt.mturk:
        status = {"success": True, "credit": "Not granted",
                  "mturkCode": ppt.key}

    elif ppt.SONA_code == "":
        status = {"success": True, "credit": "Not granted"}

    # Grant credit
    else:
        status = {"success": False, "credit": "Not granted"}
        # Build SONA Web Credit URL
        params = {
            'experiment_id': SONA_EXPT_ID,
            'credit_token': SONA_CREDIT_TOKEN,
            'survey_code': ppt.SONA_code}
        url = f"{SONA_URL}?{urlencode(params)}"

        # Send request & parse content
        response = requests.get(url)
        content = response.content.decode()
        ppt.notes = ppt.notes + f"SONA credit response:\n{content}\n"

        if check_credit_granted(content):
            status["credit"] = "Granted"
            status["success"] = True

    ppt.save()

    # Notify User
    return JsonResponse(status)


"""
Run Experiment
--------------
"""


def generate_key():
    """Generate ppt key"""
    return random.choice(wordlist)


def get_ip_address(request):
    """Get the IP Address from request."""
    # Get IP Address
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip_address = x_forwarded_for.split(',')[0]
    else:
        ip_address = request.META.get('REMOTE_ADDR', "")

    return ip_address


def init_ppt(request):
    """Create new ppt."""
    # Get params
    get_args = str(request.GET)
    sona_code = request.GET.get('code', "")
    study = request.GET.get('study', "test")
    condition = request.GET.get('condition', "")
    mturk = bool(request.GET.get('mturk', ""))
    key = generate_key()
    list_no = random.choice([1, 2, 3, 4])

    ip_address = get_ip_address(request)

    # Create DB object
    ppt = Participant.objects.create(
        ip_address=ip_address, SONA_code=sona_code, study=study,
        get_args=get_args, condition=condition, mturk=mturk, key=key,
        list_no = list_no)

    return ppt


def parse_limit(request, arg):
    """Parse string for limit arg."""
    limit = request.GET.get(arg) or None
    limit = int(limit) if limit else None
    return limit


def parse_limits(request, args):
    """Parse all stimuli limits."""
    limits = {}
    for arg in args:
        limits[f"{arg}_limit"] = parse_limit(request, arg)
    return limits


def expt1a(request):
    """Return experiment view.

    GET Args:
        {pv, irq}: set n limits for tasks
    """
    # Create ppt
    ppt = init_ppt(request)

    # GET args
    practice = not request.GET.get("p") == "0"
    intro = not request.GET.get("i") == "0"

    # Get experimental items
    limits = parse_limits(request, ["pv", "irq"])
    limits["list_no"] = ppt.list_no
    tasks = load_task_data(**limits)

    # Create view context
    conf = {"ppt_id": ppt.id, "practice": practice, "intro": intro}
    context = {"tasks": tasks, "conf": conf}

    # Return view
    return render(request, MODULE_NAME + '/expt1a.html', context)


def expt_wp(request):
    """Return word-picture experiment view.

    GET Args:
        condition: word (W) or picture (P) first?
    """
    # Create ppt
    ppt = init_ppt(request)
    condition = request.GET.get("c", random.choice(["W", "P"]))
    word_format = request.GET.get("w", "W")

    # Get experimental items
    limits = parse_limits(request, ["irq", "wp"])
    tasks = load_task_data(**limits)

    # Create view context
    conf = {"ppt_id": ppt.id, "condition": condition,
            "key": ppt.key, "wordFormat": word_format}
    context = {"tasks": tasks, "conf": conf}

    # Return view
    return render(request, MODULE_NAME + '/expt_wp.html', context)


def error(request):
    """Error page."""
    return render(request, MODULE_NAME + '/error.html')


def ua_data(request):
    """Store ppt ua_data.

    We do this asynchronously so we can get the fullscreen size
    """
    post = json.loads(request.body.decode('utf-8'))

    ppt_id = post['ppt_id']

    ppt = Participant.objects.get(pk=ppt_id)
    ppt.ua_header = post.get('ua_header', "")
    ppt.screen_width = post.get('width', "")
    ppt.screen_height = post.get('height', "")
    ppt.save()

    return JsonResponse({"success": True})


def validate_captcha(request):
    """Validate captcha token."""
    post = json.loads(request.body.decode('utf-8'))

    ppt_id = post['ppt_id']
    token = post.get('token')

    data = {"response": token,
            "secret": settings.CAPTCHA_SECRET_KEY}

    response = requests.post(RECAPTCHA_URL, data=data)

    content = response.content

    response_data = json.loads(content)

    score = response_data.get('score')
    ppt = Participant.objects.get(pk=ppt_id)
    ppt.captcha_score = score
    ppt.save()

    return JsonResponse(response_data)


"""
Download Data
-------------
"""


def is_admin(user):
    """Check if user is an admin."""
    return user.is_superuser


def get_model_data(model_name):
    """Get data on all trials."""
    model = MODELS[model_name]

    data_list = []
    for record in model.objects.all():

        data = record.__dict__
        data.pop('_state')

        data_list.append(data)

    df = pd.DataFrame(data_list)
    df = df.sort_values('id').reset_index(drop=True)
    return df


@user_passes_test(is_admin)
def download_data(request, model):
    """Download csv of model data."""
    data = get_model_data(model)

    fname = f'{MODULE_NAME}_{model}_{tz.now():%Y-%m-%d-%H-%M-%S}.csv'

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="{fname}"'

    data.to_csv(response, index=False)

    return response
