import base64
import operator
import sys

import numpy as np
import pandas as pd
from dime.dimeb import loads as dimebloads

def dict2df(prefix, v, arr):
    if isinstance(v, dict):
        for k, w in v.items():
            dict2df(prefix + "." + k, w, arr)

    elif isinstance(v, list):
        elem = {"Variable name": prefix, "Type": "List[" + str(len(v)) + "]"}
        elem.update(enumerate(v))

        arr.append(elem)

    elif isinstance(v, np.ndarray):
        elem = {"Variable name": prefix, "Type": "NDArray[" + ", ".join(map(str, v.shape)) + "]"}
        elem.update(enumerate(v.flatten()))

        arr.append(elem)

    else:
        arr.append({"Variable name": prefix, "Type": "Scalar", 0: v})

    return arr

if __name__ == "__main__":
    with open(sys.argv[1], "rb") as file:
        historyworkspace_dimeb = file.read()

    historyworkspace = dimebloads(historyworkspace_dimeb)

    try:
        del historyworkspace["workspace"]["resetTime"]
    except KeyError:
        pass

    try:
        del historyworkspace["workspace"]["currentTimeInSeconds"]
    except KeyError:
        pass

    assert historyworkspace["history"].keys() == historyworkspace["workspace"].keys()

    with pd.ExcelWriter(sys.argv[2]) as writer:
        df = []

        for h in historyworkspace["history"]["Varvgs"]:
            elem = {"t": h["t"]}
            elem.update(enumerate(h["vars"].flatten()))

            df.append(elem)

        df.sort(key = operator.itemgetter("t"))
        pd.DataFrame(df).to_excel(writer, sheet_name = "History")

        df = []

        for k, v in historyworkspace["workspace"].items():
            dict2df(k, v, df)

        pd.DataFrame(df).to_excel(writer, sheet_name = "Workspace")

        data = base64.b64encode(historyworkspace_dimeb).decode('ascii')
        pd.DataFrame([data[i:i + 1024] for i in range(0, len(data), 1024)]).to_excel(writer, sheet_name = "Raw Data")
