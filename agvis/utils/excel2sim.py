import base64
import itertools
import functools
import operator
import sys

import numpy as np
import pandas as pd
from dime.dimeb import loads as dimebloads, dumps as dimebdumps

if __name__ == "__main__":
    with open(sys.argv[1], "rb") as file:
        history = pd.read_excel(file, sheet_name = "History")
        workspace = pd.read_excel(file, sheet_name = "Workspace")
        data = pd.read_excel(file, sheet_name = "Raw Data")

    historyworkspace = dimebloads(base64.b64decode("".join(data[0]).encode('ascii')))

    # This truncation _might_ come back to bite us in the future
    varvgs = {"%.6f" % h["t"]: h for h in historyworkspace["history"]["Varvgs"]}

    for i, row in history.iterrows():
        t = "%.6f" % row["t"]

        oldvars = varvgs[t]["vars"]
        newvars = []

        for i in itertools.count():
            try:
                newvars.append(row[i])
            except KeyError:
                break

        newvars = np.array(newvars, dtype = np.float64).reshape(oldvars.shape)

        varvgs[t]["vars"] = newvars

    for i, row in workspace.iterrows():
        print(i)

        table = historyworkspace["workspace"]
        subtables = row["Variable name"].split(".")

        for i in subtables[:-1]:
            try:
                table = table[i]
            except KeyError:
                table[i] = {}
                table = table[i]

        shape = row["Type"][row["Type"].find("[") + 1:row["Type"].rfind("]")]

        if row["Type"].startswith("List"):
            x = [None] * int(shape)

            for i in range(len(x)):
                x[i] = row[i]

            table[subtables[-1]] = x

        elif row["Type"].startswith("NDArray"):
            shape = tuple(int(i) for i in shape.split(","))

            x = [None] * int(functools.reduce(operator.mul, shape))

            for i in range(len(x)):
                x[i] = row[i]

            x = np.array(x, dtype = np.float64).reshape(shape)

            table[subtables[-1]] = x

        else:
            table[subtables[-1]] = row[0]

    with open(sys.argv[2], "wb") as file:
        file.write(dimebdumps(historyworkspace))

