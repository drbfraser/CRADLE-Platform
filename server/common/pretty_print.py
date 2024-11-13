import pprint

pprinter = pprint.PrettyPrinter(indent=4, sort_dicts=False, compact=False)


def pretty_print(*args):
    pprinter.pprint(*args)
