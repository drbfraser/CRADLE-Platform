# fnames = open("./names.txt")
# lnames = open("./lastnames.txt")

# fnames = fnames.readlines()
# lnames = lnames.readlines()

# d = {"firstNames":[], "lastNames":[]}

# for name in lnames:
#     d["lastNames"].append(name.rstrip())

# for entry in fnames:
#     name, sex = entry.split(" - ")
#     sex = sex.rstrip()

#     d["firstNames"].append({"name":name, "sex":sex})

import json 
# with open ("names.json", "w") as f:
#     json.dump(d, f,indent=4)


def getNames():
    with open("names.json") as f:
        names = json.load(f)
        return names["firstNames"], names["lastNames"]


fnames, lnames = getNames()

import random
person = random.choice(fnames)
name, sex = person["name"], person["sex"]

print(name,sex)