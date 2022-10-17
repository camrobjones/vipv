"""Get GPT-3 completions for prompts."""

import re
import json

import openai
import numpy as np
import pandas as pd
from tqdm import tqdm
from scipy.stats import ttest_ind


from vipv.secrets import ORGANIZATION, API_KEY

openai.organization = ORGANIZATION
openai.api_key = API_KEY

MODULE_NAME = "vipv"




def surprise_me(logprob):
    """Convert a log probability to a surprisal (in bits)."""
    return -np.log2(np.exp(logprob))


def tokenize_target(target, pad=True):
    """Tokenize target word using GPT-3 API."""
    if pad:
        # Pad target (GPT-3 throws an error w/ one-token prompts)
        target = ". " + target

    output = openai.Completion.create(
        engine="ada",
        prompt=target,
        max_tokens=0,
        temperature=1,
        top_p=1,
        n=1,
        stream=False,
        logprobs=1,
        stop="\n",
        echo=True
        )
    tokens = output.to_dict()['choices'][0].to_dict()['logprobs']["tokens"]

    if pad:
        # Remove padding
        tokens = tokens[1:]

    return tokens


def get_completion_surprisal(prompt, completion, model="ada"):
    """Get the probability of completion from prompt."""
    # Just interested in logprobs, no completion tokens
    output = openai.Completion.create(
        engine=model,
        prompt=prompt,
        max_tokens=0,
        temperature=1,
        top_p=1,
        n=1,
        stream=False,
        logprobs=1,
        stop="\n",
        echo=True
        )
    token_data = output.to_dict()['choices'][0].to_dict()['logprobs']
    logprobs = token_data["token_logprobs"]

    # Bit of a kludge, not sure how GPT-3 tokenizer works...
    completion_tokenized = tokenize_target(completion)

    start = len(completion_tokenized)

    # Sum logprobs. First is None
    pre_spl = surprise_me(np.sum(logprobs[1:-start]))
    target_spl = surprise_me(np.sum(logprobs[-start:]))

    return (pre_spl, target_spl)




"""
Run models
----------
"""

if __name__ == "__main__":

    stimuli = pd.read_csv("vipv/data/stimuli_vermeulen_en.csv")[:184]

    surprisals = []
    for (i, row) in tqdm(stimuli.iterrows()):
        prompt = f"{row.concept.title()} can be {row.property}"
        completion = row.property
        pre_spl, target_spl = get_completion_surprisal(prompt, completion, "text-davinci-002")
        surprisals.append(target_spl)

    stimuli["spl_gpt3-text-davinci-002_title"] = surprisals

    """Save"""

    stimuli.to_csv("vipv/stats/data/stimuli.csv", index=False)