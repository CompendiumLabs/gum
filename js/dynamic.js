/**
 ** Interactive
 **/

class Interactive {
    constructor(vars, func) {
        this.func = func;
        this.vars = vars;
    }

    element() {
        let vals = map_object(this.vars, v => v.value);
        return this.func(vals);
    }
}

class Variable {
    constructor(init, args) {
        args = args ?? {};
        this.value = init;
        this.attr = filter_object(args, v => v != null);
    }

    update(val) {
        this.value = val;
    }
}

class Slider extends Variable {
    constructor(init, args) {
        let {min, max, step, ...attr} = args ?? {};
        min = min ?? 0;
        max = max ?? 100;
        step = step ?? 1;

        let attr1 = {min, max, step, ...attr};
        super(init, attr1);
    }
}

class Toggle extends Variable {
    constructor(init, args) {
        init = init ?? true;
        super(init, args);
    }
}

class List extends Variable {
    constructor(init, args) {
        let {choices, ...attr} = args ?? {};
        choices = choices ?? {};

        if (is_array(choices)) {
            choices = Object.fromEntries(choices.map(v => [v, v]));
        }

        let attr1 = {choices, ...attr};
        super(init, attr1);
    }
}

/**
 ** Animation
 **/

class Transition {
    constructor(args) {
        let {tlim} = args ?? {};
        this.tlim = tlim ?? [null, null];
    }

    frac(t, tlimf) {
        let [t0, t1] = this.tlim;
        let [t0f, t1f] = tlimf;
        t0 = t0 ?? t0f;
        t1 = t1 ?? t1f;
        let f = (t - t0) / (t1 - t0);
        return max(0, min(1, f));
    }
}

class Continuous extends Transition {
    constructor(lim, args) {
        super(args);
        this.lim = lim;
    }

    value(t, tlimf) {
        let f = this.frac(t, tlimf);
        let [lo, hi] = this.lim;
        return lo + (hi - lo) * f;
    }
}

class Discrete extends Transition {
    constructor(vals, args) {
        super(args);
        this.vals = vals;
    }

    value(t, tlimf) {
        let f = this.frac(t, tlimf);
        let i0 = floor(f * this.vals.length);
        let i = min(i0, this.vals.length - 1);
        return this.vals[i];
    }
}

class Animation {
    constructor(vars, func, args) {
        let {tlim, N} = args ?? {};
        tlim = tlim ?? [0, 1];
        N = N ?? 10;

        // total frames
        let [t0f, t1f] = tlim;
        let time = linspace(t0f, t1f, N);

        // animation state
        this.frames = time.map(t => {
            let vals = map_object(vars, v => v.value(t, tlim));
            return func(vals);
        });
    }

    frame(i) {
        let frame = this.frames[i];
        return renderElem(frame);
    }

    *animate() {
        for (let i = 0; i < this.frames.length; i++) {
            yield this.frame(i);
        }
    }
}
