class HistoryKeeper {
    constructor() {
        this.workspace = {};
        this.history = {};
    }

    lookup(varname, currentTimeInSeconds) {
        const varHistory = this.history[varname];
        let value;

        if (varHistory == null) {
            return false;
        }

        for (let i = 0; i < varHistory.length; ++i) {
            value = varHistory[i];
            const t = value.t;
            if (t >= currentTimeInSeconds) break;
        }

        this.workspace[varname] = value;
        return true;
    }

    load(buf) {
        let {workspace, history} = dime.dimebloads(buf);

        this.workspace = workspace;
        this.history = history;
    }

    save() {
        return dime.dimebdumps({history: this.history, workspace: this.workspace});
    }
}
