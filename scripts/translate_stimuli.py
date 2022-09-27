import re

from googletrans import Translator
import pandas as pd



translator = Translator()
translator.translate("gomme peut être chevelue")

sent = "gomme peut être chevelue"

ts.google(sent)
ts.deepl(sent)
ts.argos(sent) 
ts.iciba(sent)
ts.translateCom(sent)


def translate_pv(concept_fr, prop_fr, engine="deepl"):
	"""Translate a pv pair to English."""
	fr_sent = f"{concept_fr.title()} peut être {prop_fr}"
	print(fr_sent)
	en_sent = getattr(ts, engine)(fr_sent)
	print(en_sent)
	
	match = re.match("(.*) can be (.*)", en_sent)

	if match:
		return match.groups()
	
	return ("", "")


df = pd.read_csv("vipv/data/stimuli_vermeulen_fr.csv")  # Load

concept_deepl = [ ]
prop_deepl = [ ]

for ix, row in df.iterrows():

	print(ix, round(ix/len(df), 2))

	concept_fr = row["concept_fr"]
	prop_fr = row["propriétés_fr"]

	concept, prop = translate_pv(concept_fr, prop_fr, "deepl")

	concept_deepl.append(concept.upper())
	prop_deepl.append(prop)

df["concept_deepl"] = concept_deepl
df["property_deepl"] = prop_deepl


concept_argos = [ ]
prop_argos = [ ]

for ix, row in df.iterrows():

	print(ix, round(ix/len(df), 2))

	concept_fr = row["concept_fr"]
	prop_fr = row["propriétés_fr"]

	concept, prop = translate_pv(concept_fr, prop_fr, "argos")

	concept_argos.append(concept.upper())
	prop_argos.append(prop)

df["concept_argos"] = concept_argos
df["property_argos"] = prop_argos

df.to_csv("vipv/data/stimuli_vermeulen_trans.csv")


concept_iciba = []
prop_iciba = []

for ix, row in df.iterrows():

	print(ix, round(ix/len(df), 2))

	concept_fr = row["concept_fr"]
	prop_fr = row["propriétés_fr"]

	concept, prop = translate_pv(concept_fr, prop_fr, "iciba")

	concept_iciba.append(concept.upper())
	prop_iciba.append(prop)

df["concept_iciba"] = concept_iciba
df["property_iciba"] = prop_iciba



concept_goog = []
prop_goog = []

for ix, row in df.iterrows():

	print(ix, round(ix/len(df), 2))

	concept_fr = row["concept_fr"]
	prop_fr = row["propriétés_fr"]

	concept, prop = translate_pv(concept_fr, prop_fr, "google")

	concept_goog.append(concept.upper())
	prop_goog.append(prop)

df["concept_goog"] = concept_goog
df["property_goog"] = prop_goog


n_concepts = []
n_props = []

for ix, row in df.iterrows():

	concepts = [row["concept_argos"], row["concept_iciba"], row["concept_goog"]]
	n_concepts.append(len(set(concepts)))

	props = [row["property_argos"], row["property_iciba"], row["property_goog"]]
	n_props.append(len(set(props)))

df["n_concepts"] = n_concepts
df["n_props"] = n_props

df.to_csv("vipv/data/stimuli_vermeulen_trans.csv")


