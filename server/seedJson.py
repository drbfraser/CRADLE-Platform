NUM_FACS = 15




def generatePhoneNumbers():
    prefix = "+256"
    area_codes = [
        414,
        456,
        434,
        454,
        464,
        4644,
        4654,
        4714,
        4734,
        4764,
        4814,
        4834,
        4854,
        4864,
        4895,
    ]
    n = len(area_codes)
    post_fixes = [
        "".join(["{}".format(randint(0, 9)) for num in range(0, n)]) for x in range(15)
    ]

    numbers = []
    for i in range(n):
        numbers.append(prefix + "-" + str(area_codes[i]) + "-" + post_fixes[i])
    return numbers



def generateJson():
    for i in facilityLocations:


if __name__ == "__main__":
    facilityLocations = [
        "Kampala",
        "Kaliro",
        "Jinja",
        "Mbale",
        "Mityana",
        "Mubende",
        "Masindi",
        "Gulu",
        "Lira",
        "Arua",
        "Masaka",
        "Fort Portal",
        "Mbarara",
        "Kabale",
        "Iganga",
    ]

    facilityType = ["HCF_1", "HCF_2", "HCF_3", "HCF_4", "HOSPITAL"]
    facilityAbout = [
        "Has minimal resources",
        "Can do full checkup",
        "Has specialized equipment",
        "Urgent requests only",
    ]
    facilityNumbers = generatePhoneNumbers()

    