"""Database models for VIPV project."""

from django.db import models


class Participant(models.Model):
    """Class to store participant data."""

    # Identify ppt
    ip_address = models.TextField()
    key = models.TextField()  # Generated passphrase to credit ppt
    SONA_code = models.TextField(default="")  # SONA participant code
    mturk = models.BooleanField(default=False)  # Is ppt an mturk ppt?
    get_args = models.TextField(default="")  # Get args issued with request
    notes = models.TextField(default="")  # Miscellaneous notes
    study = models.TextField(default="test")  # Pilot, Control, full study
    condition = models.TextField(default="")  # Control, Visual, Verbal\
    list_no = models.TextField(default="")  # Name of stimulus list 

    # Device
    ua_header = models.TextField(default="")
    screen_width = models.TextField(default="")
    screen_height = models.TextField(default="")

    # Validation
    captcha_score = models.FloatField(blank=True, null=True)

    # Experiment
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(blank=True, null=True)

    # Demographics
    birth_year = models.IntegerField(blank=True, null=True)
    gender = models.CharField(blank=True, null=True, max_length=2)
    handedness = models.CharField(blank=True, null=True, max_length=10)
    dyslexia = models.BooleanField(blank=True, null=True)
    adhd = models.BooleanField(blank=True, null=True)
    asd = models.BooleanField(blank=True, null=True)
    vision = models.CharField(blank=True, null=True, max_length=10)
    vision_reason = models.TextField(default="")
    native_english = models.BooleanField(blank=True, null=True)

    # Feedback
    post_test_purpose = models.TextField(default="")
    post_test_variation = models.TextField(default="")
    post_test_strategy = models.TextField(default="")
    post_test_simulation = models.TextField(default="")
    post_test_modality = models.TextField(default="")
    post_test_other = models.TextField(default="")


class Rating(models.Model):
    """Responses to likert-style rating questions."""

    participant = models.ForeignKey(
        Participant,
        on_delete=models.CASCADE
    )

    # Scales
    IRQ = "IRQ"
    SCALES = [
        (IRQ, "IRQ")
    ]
    scale = models.CharField(
        max_length=11,
        choices=SCALES
    )

    # Item identifier
    item = models.IntegerField(blank=True, null=True)  # Item No.
    item_id = models.CharField(max_length=80)  # Unique (to scale) Item ID
    item_type = models.CharField(  # Critical/filler etc
        max_length=80, blank=True)
    version = models.CharField(  # Item version
        max_length=80, default="", blank=True)
    condition = models.CharField(  # Condition
        max_length=80, default="", blank=True)
    trial_index = models.IntegerField(blank=True, null=True)  # Index for ppt

    # Response info
    response = models.IntegerField()  # Participant response to question
    reaction_time = models.FloatField()  # RT in ms


class BinaryChoice(models.Model):
    """Responses to binary choice questions."""

    participant = models.ForeignKey(
        Participant,
        on_delete=models.CASCADE
    )

    # Tasks
    TASKS = [
        ("PV", "Property Verification"),
        ("ViWM", "Visual Working Memory"),
        ("AuWM", "Auditory Working Mem")
    ]
    task = models.CharField(
        max_length=4,
        choices=TASKS
    )

     # Item identifier
    item = models.CharField(max_length=80)  # Item No.
    item_id = models.CharField(max_length=80)  # Unique Item ID within task
    item_type = models.CharField(  # Critical/Filler etc
        max_length=80, blank=True)
    version = models.CharField(  # Item version
        max_length=10, blank=True, default="")
    version_id = models.CharField(max_length=80)  # Unique Version ID w/in task
    condition = models.CharField(
        max_length=80, blank=True, default="")  # Condition
    trial_index = models.IntegerField(blank=True, null=True)  # Index for ppt
    trial_id = models.CharField(  # Relate interference trials
        max_length=10,
        default="")
    block_id = models.CharField(  # Trial block
        max_length=10,
        default="")

    # Response info
    key_press = models.CharField(  # Key pressed
        max_length=10,
        default="")
    response = models.CharField(  # Participant response to question
        max_length=80,
        default="")
    correct_response = models.CharField(  # Ground truth answer
        max_length=80,
        default="")
    is_correct = models.BooleanField()  # response == correct_response
    reaction_time = models.FloatField()  # RT in ms
