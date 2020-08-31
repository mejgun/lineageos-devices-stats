
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const commitsCount = 100;
    let parseDevices = (j) => {
        let devices = new Map();
        for (let k of Object.keys(j)) {
            let d = j[k];
            d.Deps.forEach((s, i, arr) => { arr[i] = s.toLowerCase(); });
            devices.set(k, d);
        }
        return devices;
    };
    let parseRepos = (j) => {
        let repos = new Map();
        const toHours = 1000 * 60 * 60;
        let now = Date.now();
        for (let k of Object.keys(j)) {
            let el = j[k];
            let t = {
                Authors: el['a'],
                Committers: el['c'],
                Hours: [],
            };
            for (let i in Object.keys(el['t'])) {
                let d = new Date(el['t'][i]);
                let time = Math.round((now - d.getTime()) / toHours);
                t.Hours.push(time);
            }
            repos.set(k.toLowerCase(), t);
            repos = repos;
        }
        return repos;
    };
    let calculateHealth = (devices, repos) => {
        let max = 0;
        let min = 999999;
        let setMinMaxTime = (t) => {
            min = Math.min(min, t);
            max = Math.max(max, t);
        };
        devices.forEach((v) => {
            v.Deps.forEach((d) => {
                let commits = repos.get(d);
                if (commits) {
                    commits.Hours.forEach((commit) => {
                        setMinMaxTime(commit);
                    });
                }
            });
        });
        devices.forEach((e, k, map) => {
            let w = new Map();
            e.Deps.forEach((v) => {
                let commits = repos.get(v);
                let count = 0;
                let sum = 0;
                let committersCount = 0;
                let authorsCount = 0;
                if (commits) {
                    count = commits.Hours.length;
                    sum = commits.Hours.reduce((y, x) => x + y - min, 0);
                    committersCount = commits.Committers;
                    authorsCount = commits.Authors;
                }
                if (count < commitsCount) {
                    sum = sum + (commitsCount - count) * (max - min);
                }
                sum = sum / commitsCount;
                let percent = (max - min) / 100;
                sum = 100 - Math.round(sum / percent);
                let q = {
                    health: sum,
                    committersCount: committersCount,
                    authorsCount: authorsCount
                };
                w.set(v, q);
            });
            e.Repos = w;
            map.set(k, e);
        });
        return devices;
    };
    const allSelect = "All";
    let filterDevices = (devices, filters) => {
        let newD = new Map();
        devices.forEach((v, k) => {
            if (filters.build && v.Period == 0) {
                return;
            }
            if (filters.branch != allSelect && v.Branch != filters.branch) {
                return;
            }
            if (filters.oem != allSelect && v.Oem != filters.oem) {
                return;
            }
            newD.set(k, v);
        });
        return newD;
    };
    let calculateBranches = (devices) => {
        let branches = [allSelect];
        devices.forEach((v) => {
            if (!branches.includes(v.Branch) && v.Branch.length > 0) {
                branches.push(v.Branch);
            }
        });
        return branches;
    };
    let calculateOems = (devices) => {
        let oems = [allSelect];
        devices.forEach((v) => {
            if (!oems.includes(v.Oem) && v.Oem.length > 0) {
                oems.push(v.Oem);
            }
        });
        return oems;
    };

    /* src/Badge.svelte generated by Svelte v3.24.1 */

    const file = "src/Badge.svelte";

    // (10:0) {:else}
    function create_else_block(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Never";
    			attr_dev(span, "class", "badge badge-warning");
    			add_location(span, file, 10, 2, 274);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(10:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (8:22) 
    function create_if_block_2(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Nightly";
    			attr_dev(span, "class", "badge badge-success");
    			add_location(span, file, 8, 2, 215);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(8:22) ",
    		ctx
    	});

    	return block;
    }

    // (6:22) 
    function create_if_block_1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Weekly";
    			attr_dev(span, "class", "badge badge-success");
    			add_location(span, file, 6, 2, 142);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(6:22) ",
    		ctx
    	});

    	return block;
    }

    // (4:0) {#if period == 1}
    function create_if_block(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Monthly";
    			attr_dev(span, "class", "badge badge-success");
    			add_location(span, file, 4, 2, 68);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(4:0) {#if period == 1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*period*/ ctx[0] == 1) return create_if_block;
    		if (/*period*/ ctx[0] == 2) return create_if_block_1;
    		if (/*period*/ ctx[0] == 3) return create_if_block_2;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { period } = $$props;
    	const writable_props = ["period"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Badge> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Badge", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("period" in $$props) $$invalidate(0, period = $$props.period);
    	};

    	$$self.$capture_state = () => ({ period });

    	$$self.$inject_state = $$props => {
    		if ("period" in $$props) $$invalidate(0, period = $$props.period);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [period];
    }

    class Badge extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { period: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Badge",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*period*/ ctx[0] === undefined && !("period" in props)) {
    			console.warn("<Badge> was created without expected prop 'period'");
    		}
    	}

    	get period() {
    		throw new Error("<Badge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set period(value) {
    		throw new Error("<Badge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Device.svelte generated by Svelte v3.24.1 */
    const file$1 = "src/Device.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i][0];
    	child_ctx[5] = list[i][1];
    	return child_ctx;
    }

    // (22:4) {#if dev.lineage_recovery}
    function create_if_block_1$1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Recovery";
    			attr_dev(span, "class", "badge badge-info");
    			add_location(span, file$1, 22, 6, 528);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(22:4) {#if dev.lineage_recovery}",
    		ctx
    	});

    	return block;
    }

    // (48:4) {:else}
    function create_else_block$1(ctx) {
    	let a;
    	let div1;
    	let div0;
    	let div0_aria_valuenow_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "progress-bar bg-success");
    			attr_dev(div0, "role", "progressbar");
    			set_style(div0, "width", /*total*/ ctx[2]() + "%");
    			attr_dev(div0, "aria-valuenow", div0_aria_valuenow_value = /*total*/ ctx[2]());
    			attr_dev(div0, "aria-valuemin", "0");
    			attr_dev(div0, "aria-valuemax", "100");
    			add_location(div0, file$1, 50, 10, 1471);
    			attr_dev(div1, "class", "progress");
    			add_location(div1, file$1, 49, 8, 1438);
    			attr_dev(a, "href", "##");
    			add_location(a, file$1, 48, 6, 1370);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div1);
    			append_dev(div1, div0);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(48:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (30:4) {#if expandRepos}
    function create_if_block$1(ctx) {
    	let each_1_anchor;
    	let each_value = [.../*dev*/ ctx[1].Repos];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dev*/ 2) {
    				each_value = [.../*dev*/ ctx[1].Repos];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(30:4) {#if expandRepos}",
    		ctx
    	});

    	return block;
    }

    // (31:6) {#each [...dev.Repos] as [name, repo]}
    function create_each_block(ctx) {
    	let a;
    	let div1;
    	let div0;
    	let t0_value = /*repo*/ ctx[5].authorsCount + "";
    	let t0;
    	let t1;
    	let t2_value = /*repo*/ ctx[5].committersCount + "";
    	let t2;
    	let t3;
    	let div0_aria_valuenow_value;
    	let div1_title_value;
    	let t4;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = text(" (");
    			t2 = text(t2_value);
    			t3 = text(")");
    			t4 = space();
    			attr_dev(div0, "class", "progress-bar bg-success");
    			attr_dev(div0, "role", "progressbar");
    			set_style(div0, "width", /*repo*/ ctx[5].health + "%");
    			attr_dev(div0, "aria-valuenow", div0_aria_valuenow_value = /*repo*/ ctx[5].health);
    			attr_dev(div0, "aria-valuemin", "0");
    			attr_dev(div0, "aria-valuemax", "100");
    			add_location(div0, file$1, 35, 12, 993);
    			attr_dev(div1, "class", "progress");
    			attr_dev(div1, "title", div1_title_value = "" + (/*name*/ ctx[4] + " (" + /*repo*/ ctx[5].health + "%) \runique authors: " + /*repo*/ ctx[5].authorsCount + "\rcommitters: " + /*repo*/ ctx[5].committersCount));
    			add_location(div1, file$1, 32, 10, 815);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "href", a_href_value = "https://github.com/LineageOS/" + /*name*/ ctx[4]);
    			add_location(a, file$1, 31, 8, 742);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, t2);
    			append_dev(div0, t3);
    			append_dev(a, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dev*/ 2 && t0_value !== (t0_value = /*repo*/ ctx[5].authorsCount + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*dev*/ 2 && t2_value !== (t2_value = /*repo*/ ctx[5].committersCount + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*dev*/ 2) {
    				set_style(div0, "width", /*repo*/ ctx[5].health + "%");
    			}

    			if (dirty & /*dev*/ 2 && div0_aria_valuenow_value !== (div0_aria_valuenow_value = /*repo*/ ctx[5].health)) {
    				attr_dev(div0, "aria-valuenow", div0_aria_valuenow_value);
    			}

    			if (dirty & /*dev*/ 2 && div1_title_value !== (div1_title_value = "" + (/*name*/ ctx[4] + " (" + /*repo*/ ctx[5].health + "%) \runique authors: " + /*repo*/ ctx[5].authorsCount + "\rcommitters: " + /*repo*/ ctx[5].committersCount))) {
    				attr_dev(div1, "title", div1_title_value);
    			}

    			if (dirty & /*dev*/ 2 && a_href_value !== (a_href_value = "https://github.com/LineageOS/" + /*name*/ ctx[4])) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(31:6) {#each [...dev.Repos] as [name, repo]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let tr;
    	let td0;
    	let a0;
    	let t0_value = /*dev*/ ctx[1].Model + "";
    	let t0;
    	let a0_href_value;
    	let t1;
    	let td1;
    	let a1;
    	let badge;
    	let a1_href_value;
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*dev*/ ctx[1].Branch + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*dev*/ ctx[1].Oem + "";
    	let t6;
    	let t7;
    	let td4;
    	let t8_value = /*dev*/ ctx[1].Name + "";
    	let t8;
    	let t9;
    	let td5;
    	let t10;
    	let td6;
    	let current;

    	badge = new Badge({
    			props: { period: /*dev*/ ctx[1].Period },
    			$$inline: true
    		});

    	let if_block0 = /*dev*/ ctx[1].lineage_recovery && create_if_block_1$1(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*expandRepos*/ ctx[0]) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			a0 = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			a1 = element("a");
    			create_component(badge.$$.fragment);
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			td5 = element("td");
    			if_block1.c();
    			t10 = space();
    			td6 = element("td");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "href", a0_href_value = "https://wiki.lineageos.org/devices/" + /*dev*/ ctx[1].Model);
    			add_location(a0, file$1, 13, 4, 256);
    			add_location(td0, file$1, 12, 2, 247);
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "href", a1_href_value = "https://download.lineageos.org/" + /*dev*/ ctx[1].Model);
    			add_location(a1, file$1, 18, 4, 376);
    			add_location(td1, file$1, 17, 2, 367);
    			add_location(td2, file$1, 25, 2, 595);
    			add_location(td3, file$1, 26, 2, 619);
    			add_location(td4, file$1, 27, 2, 640);
    			add_location(td5, file$1, 28, 2, 662);
    			add_location(td6, file$1, 61, 2, 1736);
    			add_location(tr, file$1, 11, 0, 240);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, a0);
    			append_dev(a0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, a1);
    			mount_component(badge, a1, null);
    			append_dev(td1, t2);
    			if (if_block0) if_block0.m(td1, null);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(td4, t8);
    			append_dev(tr, t9);
    			append_dev(tr, td5);
    			if_block1.m(td5, null);
    			append_dev(tr, t10);
    			append_dev(tr, td6);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*dev*/ 2) && t0_value !== (t0_value = /*dev*/ ctx[1].Model + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*dev*/ 2 && a0_href_value !== (a0_href_value = "https://wiki.lineageos.org/devices/" + /*dev*/ ctx[1].Model)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			const badge_changes = {};
    			if (dirty & /*dev*/ 2) badge_changes.period = /*dev*/ ctx[1].Period;
    			badge.$set(badge_changes);

    			if (!current || dirty & /*dev*/ 2 && a1_href_value !== (a1_href_value = "https://download.lineageos.org/" + /*dev*/ ctx[1].Model)) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (/*dev*/ ctx[1].lineage_recovery) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(td1, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if ((!current || dirty & /*dev*/ 2) && t4_value !== (t4_value = /*dev*/ ctx[1].Branch + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty & /*dev*/ 2) && t6_value !== (t6_value = /*dev*/ ctx[1].Oem + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty & /*dev*/ 2) && t8_value !== (t8_value = /*dev*/ ctx[1].Name + "")) set_data_dev(t8, t8_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(td5, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(badge.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(badge.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(badge);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	
    	let { dev } = $$props;
    	let { expandRepos } = $$props;

    	const total = () => {
    		let t = 0;
    		dev.Repos.forEach(r => t = t + r.health);
    		return Math.round(t / dev.Repos.size);
    	};

    	const writable_props = ["dev", "expandRepos"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Device> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Device", $$slots, []);
    	const click_handler = () => $$invalidate(0, expandRepos = !expandRepos);

    	$$self.$$set = $$props => {
    		if ("dev" in $$props) $$invalidate(1, dev = $$props.dev);
    		if ("expandRepos" in $$props) $$invalidate(0, expandRepos = $$props.expandRepos);
    	};

    	$$self.$capture_state = () => ({ Badge, dev, expandRepos, total });

    	$$self.$inject_state = $$props => {
    		if ("dev" in $$props) $$invalidate(1, dev = $$props.dev);
    		if ("expandRepos" in $$props) $$invalidate(0, expandRepos = $$props.expandRepos);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [expandRepos, dev, total, click_handler];
    }

    class Device extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { dev: 1, expandRepos: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Device",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*dev*/ ctx[1] === undefined && !("dev" in props)) {
    			console.warn("<Device> was created without expected prop 'dev'");
    		}

    		if (/*expandRepos*/ ctx[0] === undefined && !("expandRepos" in props)) {
    			console.warn("<Device> was created without expected prop 'expandRepos'");
    		}
    	}

    	get dev() {
    		throw new Error("<Device>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dev(value) {
    		throw new Error("<Device>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get expandRepos() {
    		throw new Error("<Device>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expandRepos(value) {
    		throw new Error("<Device>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Filters.svelte generated by Svelte v3.24.1 */

    const file$2 = "src/Filters.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (17:8) {#each branches as b}
    function create_each_block_1(ctx) {
    	let option;
    	let t_value = /*b*/ ctx[9] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*b*/ ctx[9];
    			option.value = option.__value;
    			add_location(option, file$2, 17, 10, 349);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*branches*/ 2 && t_value !== (t_value = /*b*/ ctx[9] + "")) set_data_dev(t, t_value);

    			if (dirty & /*branches*/ 2 && option_value_value !== (option_value_value = /*b*/ ctx[9])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(17:8) {#each branches as b}",
    		ctx
    	});

    	return block;
    }

    // (25:8) {#each oems as o}
    function create_each_block$1(ctx) {
    	let option;
    	let t_value = /*o*/ ctx[6] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*o*/ ctx[6];
    			option.value = option.__value;
    			add_location(option, file$2, 25, 10, 527);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*oems*/ 4 && t_value !== (t_value = /*o*/ ctx[6] + "")) set_data_dev(t, t_value);

    			if (dirty & /*oems*/ 4 && option_value_value !== (option_value_value = /*o*/ ctx[6])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(25:8) {#each oems as o}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t2;
    	let input;
    	let t3;
    	let th2;
    	let t4;
    	let select0;
    	let t5;
    	let th3;
    	let t6;
    	let select1;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*branches*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*oems*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Code";
    			t1 = space();
    			th1 = element("th");
    			t2 = text("Build\n      ");
    			input = element("input");
    			t3 = space();
    			th2 = element("th");
    			t4 = text("Branch\n      ");
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t5 = space();
    			th3 = element("th");
    			t6 = text("OEM\n      ");
    			select1 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Model";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Repos";
    			attr_dev(th0, "scope", "col");
    			add_location(th0, file$2, 8, 4, 106);
    			attr_dev(input, "type", "checkbox");
    			add_location(input, file$2, 11, 6, 171);
    			attr_dev(th1, "scope", "col");
    			add_location(th1, file$2, 9, 4, 136);
    			if (/*value*/ ctx[0].branch === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[4].call(select0));
    			add_location(select0, file$2, 15, 6, 274);
    			attr_dev(th2, "scope", "col");
    			add_location(th2, file$2, 13, 4, 238);
    			if (/*value*/ ctx[0].oem === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[5].call(select1));
    			add_location(select1, file$2, 23, 6, 459);
    			attr_dev(th3, "scope", "col");
    			add_location(th3, file$2, 21, 4, 426);
    			attr_dev(th4, "scope", "col");
    			add_location(th4, file$2, 29, 4, 604);
    			attr_dev(th5, "scope", "col");
    			set_style(th5, "width", "25%");
    			add_location(th5, file$2, 30, 4, 635);
    			add_location(tr, file$2, 7, 2, 97);
    			add_location(thead, file$2, 6, 0, 87);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(th1, t2);
    			append_dev(th1, input);
    			input.checked = /*value*/ ctx[0].build;
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(th2, t4);
    			append_dev(th2, select0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select0, null);
    			}

    			select_option(select0, /*value*/ ctx[0].branch);
    			append_dev(tr, t5);
    			append_dev(tr, th3);
    			append_dev(th3, t6);
    			append_dev(th3, select1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			select_option(select1, /*value*/ ctx[0].oem);
    			append_dev(tr, t7);
    			append_dev(tr, th4);
    			append_dev(tr, t9);
    			append_dev(tr, th5);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[3]),
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[4]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[5])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*value, branches*/ 3) {
    				input.checked = /*value*/ ctx[0].build;
    			}

    			if (dirty & /*branches*/ 2) {
    				each_value_1 = /*branches*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*value, branches*/ 3) {
    				select_option(select0, /*value*/ ctx[0].branch);
    			}

    			if (dirty & /*oems*/ 4) {
    				each_value = /*oems*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*value, branches*/ 3) {
    				select_option(select1, /*value*/ ctx[0].oem);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	
    	let { value } = $$props;
    	let { branches } = $$props;
    	let { oems } = $$props;
    	const writable_props = ["value", "branches", "oems"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Filters> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Filters", $$slots, []);

    	function input_change_handler() {
    		value.build = this.checked;
    		$$invalidate(0, value);
    		$$invalidate(1, branches);
    	}

    	function select0_change_handler() {
    		value.branch = select_value(this);
    		$$invalidate(0, value);
    		$$invalidate(1, branches);
    	}

    	function select1_change_handler() {
    		value.oem = select_value(this);
    		$$invalidate(0, value);
    		$$invalidate(1, branches);
    	}

    	$$self.$$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("branches" in $$props) $$invalidate(1, branches = $$props.branches);
    		if ("oems" in $$props) $$invalidate(2, oems = $$props.oems);
    	};

    	$$self.$capture_state = () => ({ value, branches, oems });

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("branches" in $$props) $$invalidate(1, branches = $$props.branches);
    		if ("oems" in $$props) $$invalidate(2, oems = $$props.oems);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		branches,
    		oems,
    		input_change_handler,
    		select0_change_handler,
    		select1_change_handler
    	];
    }

    class Filters extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { value: 0, branches: 1, oems: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Filters",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<Filters> was created without expected prop 'value'");
    		}

    		if (/*branches*/ ctx[1] === undefined && !("branches" in props)) {
    			console.warn("<Filters> was created without expected prop 'branches'");
    		}

    		if (/*oems*/ ctx[2] === undefined && !("oems" in props)) {
    			console.warn("<Filters> was created without expected prop 'oems'");
    		}
    	}

    	get value() {
    		throw new Error("<Filters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Filters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get branches() {
    		throw new Error("<Filters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set branches(value) {
    		throw new Error("<Filters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get oems() {
    		throw new Error("<Filters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set oems(value) {
    		throw new Error("<Filters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/DeviceList.svelte generated by Svelte v3.24.1 */
    const file$3 = "src/DeviceList.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i][1];
    	return child_ctx;
    }

    // (30:4) {#each [...filtered] as [, dev] (dev.Model)}
    function create_each_block$2(key_1, ctx) {
    	let first;
    	let device;
    	let current;

    	device = new Device({
    			props: {
    				dev: /*dev*/ ctx[9],
    				expandRepos: /*expandRepos*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(device.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(device, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const device_changes = {};
    			if (dirty & /*filtered*/ 1) device_changes.dev = /*dev*/ ctx[9];
    			if (dirty & /*expandRepos*/ 4) device_changes.expandRepos = /*expandRepos*/ ctx[2];
    			device.$set(device_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(device.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(device.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(device, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(30:4) {#each [...filtered] as [, dev] (dev.Model)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let label;
    	let t0;
    	let input;
    	let t1;
    	let table;
    	let filters_1;
    	let updating_value;
    	let t2;
    	let tbody;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let mounted;
    	let dispose;

    	function filters_1_value_binding(value) {
    		/*filters_1_value_binding*/ ctx[7].call(null, value);
    	}

    	let filters_1_props = {
    		branches: calculateBranches(/*devices*/ ctx[3]),
    		oems: calculateOems(/*devices*/ ctx[3])
    	};

    	if (/*filters*/ ctx[1] !== void 0) {
    		filters_1_props.value = /*filters*/ ctx[1];
    	}

    	filters_1 = new Filters({ props: filters_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(filters_1, "value", filters_1_value_binding));
    	let each_value = [.../*filtered*/ ctx[0]];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*dev*/ ctx[9].Model;
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			label = element("label");
    			t0 = text("Expand repos\n  ");
    			input = element("input");
    			t1 = space();
    			table = element("table");
    			create_component(filters_1.$$.fragment);
    			t2 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(input, "type", "checkbox");
    			add_location(input, file$3, 20, 2, 582);
    			add_location(label, file$3, 18, 0, 557);
    			add_location(tbody, file$3, 28, 2, 795);
    			attr_dev(table, "class", "table table-dark");
    			add_location(table, file$3, 23, 0, 645);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t0);
    			append_dev(label, input);
    			input.checked = /*expandRepos*/ ctx[2];
    			insert_dev(target, t1, anchor);
    			insert_dev(target, table, anchor);
    			mount_component(filters_1, table, null);
    			append_dev(table, t2);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[6]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*expandRepos*/ 4) {
    				input.checked = /*expandRepos*/ ctx[2];
    			}

    			const filters_1_changes = {};

    			if (!updating_value && dirty & /*filters*/ 2) {
    				updating_value = true;
    				filters_1_changes.value = /*filters*/ ctx[1];
    				add_flush_callback(() => updating_value = false);
    			}

    			filters_1.$set(filters_1_changes);

    			if (dirty & /*filtered, expandRepos*/ 5) {
    				const each_value = [.../*filtered*/ ctx[0]];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, tbody, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(filters_1.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(filters_1.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(table);
    			destroy_component(filters_1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	
    	let { deviceList } = $$props;
    	let { repoList } = $$props;
    	let filtered;

    	let filters = {
    		build: false,
    		oem: allSelect,
    		branch: allSelect
    	};

    	let expandRepos = false;
    	const devices = parseDevices(deviceList);
    	const repos = parseRepos(repoList);
    	const writable_props = ["deviceList", "repoList"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DeviceList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DeviceList", $$slots, []);

    	function input_change_handler() {
    		expandRepos = this.checked;
    		$$invalidate(2, expandRepos);
    	}

    	function filters_1_value_binding(value) {
    		filters = value;
    		$$invalidate(1, filters);
    	}

    	$$self.$$set = $$props => {
    		if ("deviceList" in $$props) $$invalidate(4, deviceList = $$props.deviceList);
    		if ("repoList" in $$props) $$invalidate(5, repoList = $$props.repoList);
    	};

    	$$self.$capture_state = () => ({
    		parseRepos,
    		parseDevices,
    		calculateHealth,
    		filterDevices,
    		calculateOems,
    		calculateBranches,
    		allSelect,
    		Device,
    		Filters,
    		deviceList,
    		repoList,
    		filtered,
    		filters,
    		expandRepos,
    		devices,
    		repos
    	});

    	$$self.$inject_state = $$props => {
    		if ("deviceList" in $$props) $$invalidate(4, deviceList = $$props.deviceList);
    		if ("repoList" in $$props) $$invalidate(5, repoList = $$props.repoList);
    		if ("filtered" in $$props) $$invalidate(0, filtered = $$props.filtered);
    		if ("filters" in $$props) $$invalidate(1, filters = $$props.filters);
    		if ("expandRepos" in $$props) $$invalidate(2, expandRepos = $$props.expandRepos);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*filters*/ 2) {
    			 $$invalidate(0, filtered = calculateHealth(filterDevices(devices, filters), repos));
    		}
    	};

    	return [
    		filtered,
    		filters,
    		expandRepos,
    		devices,
    		deviceList,
    		repoList,
    		input_change_handler,
    		filters_1_value_binding
    	];
    }

    class DeviceList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { deviceList: 4, repoList: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DeviceList",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*deviceList*/ ctx[4] === undefined && !("deviceList" in props)) {
    			console.warn("<DeviceList> was created without expected prop 'deviceList'");
    		}

    		if (/*repoList*/ ctx[5] === undefined && !("repoList" in props)) {
    			console.warn("<DeviceList> was created without expected prop 'repoList'");
    		}
    	}

    	get deviceList() {
    		throw new Error("<DeviceList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set deviceList(value) {
    		throw new Error("<DeviceList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get repoList() {
    		throw new Error("<DeviceList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set repoList(value) {
    		throw new Error("<DeviceList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.24.1 */
    const file$4 = "src/App.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (37:2) {#if alerts}
    function create_if_block_2$1(ctx) {
    	let each_1_anchor;
    	let each_value = /*alerts*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*alerts*/ 16) {
    				each_value = /*alerts*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(37:2) {#if alerts}",
    		ctx
    	});

    	return block;
    }

    // (38:4) {#each alerts as a}
    function create_each_block$3(ctx) {
    	let div;
    	let t_value = /*a*/ ctx[8] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "alert alert-danger");
    			attr_dev(div, "role", "alert");
    			add_location(div, file$4, 38, 6, 728);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*alerts*/ 16 && t_value !== (t_value = /*a*/ ctx[8] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(38:4) {#each alerts as a}",
    		ctx
    	});

    	return block;
    }

    // (46:2) {:else}
    function create_else_block$2(ctx) {
    	let button;
    	let t0;
    	let t1;
    	let p;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text("Load data");
    			t1 = space();
    			p = element("p");
    			p.textContent = `Now: ${Date()}`;
    			button.disabled = /*pressed*/ ctx[2];
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$4, 46, 4, 932);
    			add_location(p, file$4, 53, 4, 1076);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*loadData*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pressed*/ 4) {
    				prop_dev(button, "disabled", /*pressed*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(46:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (44:20) 
    function create_if_block_1$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading...";
    			add_location(p, file$4, 44, 4, 900);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(44:20) ",
    		ctx
    	});

    	return block;
    }

    // (42:2) {#if loaded}
    function create_if_block$2(ctx) {
    	let devicelist;
    	let current;

    	devicelist = new DeviceList({
    			props: {
    				deviceList: /*devices*/ ctx[0],
    				repoList: /*repos*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(devicelist.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(devicelist, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const devicelist_changes = {};
    			if (dirty & /*devices*/ 1) devicelist_changes.deviceList = /*devices*/ ctx[0];
    			if (dirty & /*repos*/ 2) devicelist_changes.repoList = /*repos*/ ctx[1];
    			devicelist.$set(devicelist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(devicelist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(devicelist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(devicelist, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(42:2) {#if loaded}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let main;
    	let t0;
    	let current_block_type_index;
    	let if_block1;
    	let t1;
    	let p;
    	let a;
    	let current;
    	let if_block0 = /*alerts*/ ctx[4] && create_if_block_2$1(ctx);
    	const if_block_creators = [create_if_block$2, create_if_block_1$2, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*loaded*/ ctx[3]) return 0;
    		if (/*pressed*/ ctx[2]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if_block1.c();
    			t1 = space();
    			p = element("p");
    			a = element("a");
    			a.textContent = "GitHub";
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "href", "https://github.com/mejgun/lineageos-devices-stats");
    			add_location(a, file$4, 56, 4, 1115);
    			add_location(p, file$4, 55, 2, 1107);
    			add_location(main, file$4, 35, 0, 676);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t0);
    			if_blocks[current_block_type_index].m(main, null);
    			append_dev(main, t1);
    			append_dev(main, p);
    			append_dev(p, a);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*alerts*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					if_block0.m(main, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(main, t1);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let devices;
    	let repos;
    	let pressed = false;
    	let loaded = false;
    	let alerts = [];

    	let loadData = () => {
    		$$invalidate(2, pressed = true);

    		fetch("/devices.json").then(s => s.json().then(t => {
    			$$invalidate(0, devices = t);
    			loadRepos();
    		}).catch(addAlert)).catch(addAlert);
    	};

    	let loadRepos = () => {
    		fetch("/repos.json").then(s => s.json().then(t => {
    			$$invalidate(1, repos = t);
    			$$invalidate(3, loaded = true);
    		}).catch(addAlert)).catch(addAlert);
    	};

    	let addAlert = s => {
    		alerts.push(s);
    		$$invalidate(4, alerts);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		DeviceList,
    		devices,
    		repos,
    		pressed,
    		loaded,
    		alerts,
    		loadData,
    		loadRepos,
    		addAlert
    	});

    	$$self.$inject_state = $$props => {
    		if ("devices" in $$props) $$invalidate(0, devices = $$props.devices);
    		if ("repos" in $$props) $$invalidate(1, repos = $$props.repos);
    		if ("pressed" in $$props) $$invalidate(2, pressed = $$props.pressed);
    		if ("loaded" in $$props) $$invalidate(3, loaded = $$props.loaded);
    		if ("alerts" in $$props) $$invalidate(4, alerts = $$props.alerts);
    		if ("loadData" in $$props) $$invalidate(5, loadData = $$props.loadData);
    		if ("loadRepos" in $$props) loadRepos = $$props.loadRepos;
    		if ("addAlert" in $$props) addAlert = $$props.addAlert;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [devices, repos, pressed, loaded, alerts, loadData];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    const app = new App({ target: document.body });

    return app;

}());
