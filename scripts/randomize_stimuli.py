"""
Generate 4 counterbalanced lists of stimuli.
"""

import pandas as pd

stimuli = pd.read_csv("vipv/data/stimuli_vermeulen_en.csv")

stimuli = stimuli.iloc[:184]  # Remove extra rows

# Fix no.115
stimuli.loc[114,"son"] = "8.wav"
stimuli.loc[114,"sonb"] = "9.wav"


# Create variable columns
stimuli["varcode"] = stimuli["code2"]
stimuli["item_type"] = stimuli["code1"].apply(lambda x: x[:2]).map({"vé":"critical", "Fi": "filler"})
stimuli["pvm"] = stimuli["code1"].apply(lambda x: x[-5:-3])
stimuli["wmm"] = stimuli["varcode"].apply(lambda x: x[:2])
stimuli["wml"] = stimuli["varcode"].apply(lambda x: x[4:5])
stimuli["pvt"] = stimuli["varcode"].apply(lambda x: x[5:6])
stimuli["wmt"] = stimuli["varcode"].apply(lambda x: x[6:7])
stimuli["idx"] = stimuli["code1"].apply(lambda x: x[-1])

stimuli["image1b"] = stimuli["1b"]
stimuli["image2b"] = stimuli["2b"]
stimuli["image3b"] = stimuli["3b"]

stimuli["wm_modality"] = stimuli["wmm"].map({"au":"audio", "vi": "visual"})
stimuli["wm_load"] = stimuli["wml"]
stimuli["pv_modality"] = stimuli["pvm"].map({"FV": "F", "VF": "F", "au": "au", "vi": "vi"})

# Checks

# AU WMM / WML
assert (stimuli.loc[(stimuli["wmm"] == "au") & (stimuli["wml"] == "0"), "son"] == "rien").all()
assert (stimuli.loc[(stimuli["wmm"] == "au") & (stimuli["wml"] == "1"), "son"].apply(lambda x: x[-3:]) == "wav").all()
assert (stimuli.loc[(stimuli["wmm"] == "au") & (stimuli["wml"] == "3"), "son"].apply(lambda x: int(x[0])) > 2).all()

# VI WMM / WML
assert (stimuli.loc[(stimuli["wmm"] == "vi") & (stimuli["wml"] == "0"), "image1"] == "rien").all()
assert (stimuli.loc[(stimuli["wmm"] == "vi") & (stimuli["wml"] == "1"), "image1"].apply(lambda x: x[-3:]) == "bmp").all()
assert (stimuli.loc[(stimuli["wmm"] == "vi") & (stimuli["wml"] == "3"), "image3"].apply(lambda x: x[-3:]) == "bmp").all()

# AU WMT
assert stimuli[(stimuli["wmm"] == "au") & (stimuli["wmt"] == "v")].apply(lambda x: x["son"] == x["sonb"], axis=1).all()
assert stimuli[(stimuli["wmm"] == "au") & (stimuli["wmt"] == "f") & (stimuli["wml"].astype(int) > 0)].apply(lambda x: x["son"] != x["sonb"], axis=1).all()

# VI WMT
assert stimuli[(stimuli["wmm"] == "vi") & (stimuli["wmt"] == "v")].apply(
	lambda x: str(x["image1"]) + str(x["image2"]) + str(x["image3"]) == str(x["image1b"]) + str(x["image2b"]) + str(x["image3b"]), axis=1).all()

assert stimuli[(stimuli["wmm"] == "vi") & (stimuli["wmt"] == "f") & (stimuli["wml"].astype(int) > 0)].apply(
	lambda x: str(x["image1"]) + str(x["image2"]) + str(x["image3"]) != str(x["image1b"]) + str(x["image2b"]) + str(x["image3b"]), axis=1).all()


# WM instructions
def create_wm_instructions(row):
	s = "" if row["wml"] == "1" else "s"
	if row["wmm"] == "au":
		return f"You will hear {row['wml']} sound{s}"

	if row["wmm"] == "vi":
		return f"You will see {row['wml']} image{s}"

stimuli["wm_instruction"] = stimuli.apply(create_wm_instructions, axis=1)

stimuli["correct_response_wm"] = stimuli["wmt"].map({"v":"Same", "f": "Different"})
stimuli["correct_response_pv"] = stimuli["pvt"].map({"v":"True", "f": "False"})

critical = stimuli[stimuli["item_type"] == "critical"]
critical = critical[critical["wml"] != "0"]

fillers = stimuli[~stimuli["item_id"].isin(critical["item_id"])]

def change_list(df):
	"""Change list conditions."""
	new = df.copy(deep=True)

	# Get lists
	list_a = new[new["list"] == "A"]
	list_b = new[new["list"] == "B"]
	list_c = new[new["list"] == "C"]
	list_d = new[new["list"] == "D"]

	# Update lists
	list_a["list"] = "B"
	list_b["list"] = "C"
	list_c["list"] = "D"
	list_d["list"] = "A"

	new = pd.concat([list_a, list_b, list_c, list_d])

	new["list_id"] = new.list + "_" + new.list_idx.astype(str)

	return new



# create two dfs
# list_index ids
# Merge
# Change list no & re-merge

# Create lists
critical["list"] = ""
critical.loc[(critical["wmm"] == "au") & (critical["wml"] == "1"), "list"] = "A"
critical.loc[(critical["wmm"] == "au") & (critical["wml"] == "3"), "list"] = "B"
critical.loc[(critical["wmm"] == "vi") & (critical["wml"] == "1"), "list"] = "C"
critical.loc[(critical["wmm"] == "vi") & (critical["wml"] == "3"), "list"] = "D"

# Add list ids
critical.sort_values("list", inplace=True)
critical["list_idx"] = 4 * list(range(12))
critical["list_id"] = critical.list + "_" + critical.list_idx.astype(str)

# Split into pv and wm dfs
critical_pv = critical[["list", "list_idx", "list_id", "item_type", "pv_modality", "correct_response_pv", "concept", "property", "item_id"]]
critical_wm = critical[["list", "list_idx", "list_id", "wm_modality", "wm_load", "wm_instruction", "correct_response_wm", "son", "sonb", "image1", "image2", "image3", "image1b", "image2b", "image3b"]]

# Add list vars to fillers
fillers["list"] = ""
fillers["list_id"] = ""
fillers["list_idx"] = ""


list_1 = pd.merge(critical_pv, critical_wm, on=["list", "list_id", "list_idx"])
fillers = fillers.loc[:, list_1.columns]
list_1 = pd.concat([list_1, fillers])

critical_pv = change_list(critical_pv)
list_2 = pd.merge(critical_pv, critical_wm, on=["list", "list_id", "list_idx"])
list_2 = pd.concat([list_2, fillers])

critical_pv = change_list(critical_pv)
list_3 = pd.merge(critical_pv, critical_wm, on=["list", "list_id", "list_idx"])
list_3 = pd.concat([list_3, fillers])

critical_pv = change_list(critical_pv)
list_4 = pd.merge(critical_pv, critical_wm, on=["list", "list_id", "list_idx"])
list_4 = pd.concat([list_4, fillers])

list_1.to_csv("vipv/data/stimuli_vermeulen_list_1.csv", index=False)
list_2.to_csv("vipv/data/stimuli_vermeulen_list_2.csv", index=False)
list_3.to_csv("vipv/data/stimuli_vermeulen_list_3.csv", index=False)
list_4.to_csv("vipv/data/stimuli_vermeulen_list_4.csv", index=False)
