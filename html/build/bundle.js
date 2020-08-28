
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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
            devices.set(k, d);
        }
        return devices;
    };
    let parseRepos = (j) => {
        let maxTime = 0;
        let minTime = 999999;
        let setMinMaxTime = (t) => {
            minTime = Math.min(minTime, t);
            maxTime = Math.max(maxTime, t);
        };
        let repos = new Map();
        const toHours = 1000 * 60 * 60 * 24;
        let now = Date.now();
        for (let k of Object.keys(j)) {
            let t = [];
            for (let i in Object.keys(j[k])) {
                let e = j[k];
                let temp = e[i]["commit"]["committer"];
                let d = new Date(e[i]["commit"]["committer"]["date"]);
                let time = Math.round((now - d.getTime()) / toHours);
                temp["Hours"] = time;
                temp["Date"] = d;
                t.push(temp);
                setMinMaxTime(time);
            }
            repos.set(k.toLowerCase(), t);
            repos = repos;
        }
        return [repos, minTime, maxTime];
    };
    let calculateHealth = (devices, r, min, max) => {
        devices.forEach((e, k, map) => {
            let w = new Map();
            e.Deps.forEach((v) => {
                let commits = r.get(v);
                let count = 0;
                let sum = 0;
                let committersCount = 0;
                if (commits) {
                    count = commits.length;
                    let numbers = commits.map((x) => x.Hours);
                    sum = numbers.reduce((y, x) => x + y - min, 0);
                    committersCount = new Set(commits.map((x) => x.Email)).size;
                }
                if (count < commitsCount) {
                    sum = sum + (commitsCount - count) * (max - min);
                }
                sum = sum / commitsCount;
                let percent = (max - min) / 100;
                sum = 100 - Math.round(sum / percent);
                console.log(v, sum);
                let q = { health: sum, committersCount: committersCount };
                w.set(v, q);
            });
            e.Repos = w;
            map.set(k, e);
        });
        return devices;
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
    	child_ctx[1] = list[i][0];
    	child_ctx[2] = list[i][1];
    	return child_ctx;
    }

    // (14:4) {#if dev.lineage_recovery}
    function create_if_block$1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Recovery";
    			attr_dev(span, "class", "badge badge-info");
    			add_location(span, file$1, 14, 6, 286);
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(14:4) {#if dev.lineage_recovery}",
    		ctx
    	});

    	return block;
    }

    // (22:4) {#each [...dev.Repos] as [name, repo]}
    function create_each_block(ctx) {
    	let div2;
    	let a;
    	let div1;
    	let div0;
    	let t0_value = /*repo*/ ctx[2].committersCount + "";
    	let t0;
    	let div0_aria_valuenow_value;
    	let div1_title_value;
    	let a_href_value;
    	let t1;
    	let t2_value = /*repo*/ ctx[2].health + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			a = element("a");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = text("%\n      ");
    			attr_dev(div0, "class", "progress-bar bg-success");
    			attr_dev(div0, "role", "progressbar");
    			set_style(div0, "width", /*repo*/ ctx[2].health + "%");
    			attr_dev(div0, "aria-valuenow", div0_aria_valuenow_value = /*repo*/ ctx[2].health);
    			attr_dev(div0, "aria-valuemin", "0");
    			attr_dev(div0, "aria-valuemax", "100");
    			add_location(div0, file$1, 25, 12, 609);
    			attr_dev(div1, "class", "progress");
    			attr_dev(div1, "title", div1_title_value = /*name*/ ctx[1]);
    			add_location(div1, file$1, 24, 10, 561);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "href", a_href_value = "https://github.com/LineageOS/" + /*name*/ ctx[1]);
    			add_location(a, file$1, 23, 8, 488);
    			add_location(div2, file$1, 22, 6, 474);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, a);
    			append_dev(a, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, t2);
    			append_dev(div2, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dev*/ 1 && t0_value !== (t0_value = /*repo*/ ctx[2].committersCount + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*dev*/ 1) {
    				set_style(div0, "width", /*repo*/ ctx[2].health + "%");
    			}

    			if (dirty & /*dev*/ 1 && div0_aria_valuenow_value !== (div0_aria_valuenow_value = /*repo*/ ctx[2].health)) {
    				attr_dev(div0, "aria-valuenow", div0_aria_valuenow_value);
    			}

    			if (dirty & /*dev*/ 1 && div1_title_value !== (div1_title_value = /*name*/ ctx[1])) {
    				attr_dev(div1, "title", div1_title_value);
    			}

    			if (dirty & /*dev*/ 1 && a_href_value !== (a_href_value = "https://github.com/LineageOS/" + /*name*/ ctx[1])) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*dev*/ 1 && t2_value !== (t2_value = /*repo*/ ctx[2].health + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(22:4) {#each [...dev.Repos] as [name, repo]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let tr;
    	let td0;
    	let a;
    	let t0_value = /*dev*/ ctx[0].Model + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let td1;
    	let badge;
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*dev*/ ctx[0].Branch + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*dev*/ ctx[0].Oem + "";
    	let t6;
    	let t7;
    	let td4;
    	let t8_value = /*dev*/ ctx[0].Name + "";
    	let t8;
    	let t9;
    	let td5;
    	let t10;
    	let td6;
    	let current;

    	badge = new Badge({
    			props: { period: /*dev*/ ctx[0].Period },
    			$$inline: true
    		});

    	let if_block = /*dev*/ ctx[0].lineage_recovery && create_if_block$1(ctx);
    	let each_value = [.../*dev*/ ctx[0].Repos];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			create_component(badge.$$.fragment);
    			t2 = space();
    			if (if_block) if_block.c();
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

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t10 = space();
    			td6 = element("td");
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "href", a_href_value = "https://wiki.lineageos.org/devices/" + /*dev*/ ctx[0].Model);
    			add_location(a, file$1, 7, 4, 99);
    			add_location(td0, file$1, 6, 2, 90);
    			add_location(td1, file$1, 11, 2, 210);
    			add_location(td2, file$1, 17, 2, 353);
    			add_location(td3, file$1, 18, 2, 377);
    			add_location(td4, file$1, 19, 2, 398);
    			add_location(td5, file$1, 20, 2, 420);
    			add_location(td6, file$1, 40, 2, 990);
    			add_location(tr, file$1, 5, 0, 83);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, a);
    			append_dev(a, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			mount_component(badge, td1, null);
    			append_dev(td1, t2);
    			if (if_block) if_block.m(td1, null);
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

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(td5, null);
    			}

    			append_dev(tr, t10);
    			append_dev(tr, td6);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*dev*/ 1) && t0_value !== (t0_value = /*dev*/ ctx[0].Model + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*dev*/ 1 && a_href_value !== (a_href_value = "https://wiki.lineageos.org/devices/" + /*dev*/ ctx[0].Model)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			const badge_changes = {};
    			if (dirty & /*dev*/ 1) badge_changes.period = /*dev*/ ctx[0].Period;
    			badge.$set(badge_changes);

    			if (/*dev*/ ctx[0].lineage_recovery) {
    				if (if_block) ; else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(td1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if ((!current || dirty & /*dev*/ 1) && t4_value !== (t4_value = /*dev*/ ctx[0].Branch + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty & /*dev*/ 1) && t6_value !== (t6_value = /*dev*/ ctx[0].Oem + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty & /*dev*/ 1) && t8_value !== (t8_value = /*dev*/ ctx[0].Name + "")) set_data_dev(t8, t8_value);

    			if (dirty & /*dev*/ 1) {
    				each_value = [.../*dev*/ ctx[0].Repos];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(td5, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
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
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
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
    	const writable_props = ["dev"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Device> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Device", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("dev" in $$props) $$invalidate(0, dev = $$props.dev);
    	};

    	$$self.$capture_state = () => ({ Badge, dev });

    	$$self.$inject_state = $$props => {
    		if ("dev" in $$props) $$invalidate(0, dev = $$props.dev);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [dev];
    }

    class Device extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { dev: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Device",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*dev*/ ctx[0] === undefined && !("dev" in props)) {
    			console.warn("<Device> was created without expected prop 'dev'");
    		}
    	}

    	get dev() {
    		throw new Error("<Device>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dev(value) {
    		throw new Error("<Device>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/DeviceList.svelte generated by Svelte v3.24.1 */

    const { console: console_1 } = globals;
    const file$2 = "src/DeviceList.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i][1];
    	return child_ctx;
    }

    // (25:4) {#each [...devices] as [, dev]}
    function create_each_block$1(ctx) {
    	let device;
    	let current;

    	device = new Device({
    			props: { dev: /*dev*/ ctx[6] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(device.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(device, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const device_changes = {};
    			if (dirty & /*devices*/ 1) device_changes.dev = /*dev*/ ctx[6];
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
    			destroy_component(device, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(25:4) {#each [...devices] as [, dev]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let tbody;
    	let current;
    	let each_value = [.../*devices*/ ctx[0]];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Code";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Build";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Branch";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "OEM";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Model";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Repos";
    			t11 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(th0, "scope", "col");
    			add_location(th0, file$2, 15, 6, 490);
    			attr_dev(th1, "scope", "col");
    			add_location(th1, file$2, 16, 6, 522);
    			attr_dev(th2, "scope", "col");
    			add_location(th2, file$2, 17, 6, 555);
    			attr_dev(th3, "scope", "col");
    			add_location(th3, file$2, 18, 6, 589);
    			attr_dev(th4, "scope", "col");
    			add_location(th4, file$2, 19, 6, 620);
    			attr_dev(th5, "scope", "col");
    			add_location(th5, file$2, 20, 6, 653);
    			add_location(tr, file$2, 14, 4, 479);
    			add_location(thead, file$2, 13, 2, 467);
    			add_location(tbody, file$2, 23, 2, 703);
    			attr_dev(table, "class", "table table-striped");
    			add_location(table, file$2, 12, 0, 429);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(tr, t5);
    			append_dev(tr, th3);
    			append_dev(tr, t7);
    			append_dev(tr, th4);
    			append_dev(tr, t9);
    			append_dev(tr, th5);
    			append_dev(table, t11);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*devices*/ 1) {
    				each_value = [.../*devices*/ ctx[0]];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
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
    	
    	let { deviceList } = $$props;
    	let { repoList } = $$props;

    	// let calculateHealth = (repos: Map<string, CommitT[]>) => {};
    	let devices = parseDevices(deviceList);

    	let [repos, minTime, maxTime] = parseRepos(repoList);
    	devices = calculateHealth(devices, repos, minTime, maxTime);
    	console.log(devices);
    	const writable_props = ["deviceList", "repoList"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<DeviceList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DeviceList", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("deviceList" in $$props) $$invalidate(1, deviceList = $$props.deviceList);
    		if ("repoList" in $$props) $$invalidate(2, repoList = $$props.repoList);
    	};

    	$$self.$capture_state = () => ({
    		parseRepos,
    		parseDevices,
    		calculateHealth,
    		Device,
    		deviceList,
    		repoList,
    		devices,
    		repos,
    		minTime,
    		maxTime
    	});

    	$$self.$inject_state = $$props => {
    		if ("deviceList" in $$props) $$invalidate(1, deviceList = $$props.deviceList);
    		if ("repoList" in $$props) $$invalidate(2, repoList = $$props.repoList);
    		if ("devices" in $$props) $$invalidate(0, devices = $$props.devices);
    		if ("repos" in $$props) repos = $$props.repos;
    		if ("minTime" in $$props) minTime = $$props.minTime;
    		if ("maxTime" in $$props) maxTime = $$props.maxTime;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [devices, deviceList, repoList];
    }

    class DeviceList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { deviceList: 1, repoList: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DeviceList",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*deviceList*/ ctx[1] === undefined && !("deviceList" in props)) {
    			console_1.warn("<DeviceList> was created without expected prop 'deviceList'");
    		}

    		if (/*repoList*/ ctx[2] === undefined && !("repoList" in props)) {
    			console_1.warn("<DeviceList> was created without expected prop 'repoList'");
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

    const { console: console_1$1 } = globals;
    const file$3 = "src/App.svelte";

    // (28:2) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let button;
    	let t0;
    	let t1;
    	let p;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			t0 = text("Load data");
    			t1 = space();
    			p = element("p");
    			p.textContent = `${Date()}`;
    			button.disabled = /*pressed*/ ctx[2];
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$3, 29, 6, 634);
    			add_location(p, file$3, 36, 6, 792);
    			attr_dev(div, "class", "container");
    			add_location(div, file$3, 28, 4, 604);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, t0);
    			append_dev(div, t1);
    			append_dev(div, p);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*loadData*/ ctx[4], false, false, false);
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
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(28:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (26:2) {#if loaded}
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
    		source: "(26:2) {#if loaded}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*loaded*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if_block.c();
    			add_location(main, file$3, 24, 0, 511);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if_blocks[current_block_type_index].m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
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
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(main, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_blocks[current_block_type_index].d();
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
    	let devices;
    	let repos;
    	let pressed = false;
    	let loaded = false;

    	let loadData = () => {
    		$$invalidate(2, pressed = true);

    		fetch("/devices.json").then(s => s.json().then(t => {
    			$$invalidate(0, devices = t);
    			loadRepos();
    		})).catch(console.log);
    	};

    	let loadRepos = () => {
    		fetch("/repos.json").then(s => s.json().then(t => {
    			$$invalidate(1, repos = t);
    			$$invalidate(3, loaded = true);
    		})).catch(console.log);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		DeviceList,
    		devices,
    		repos,
    		pressed,
    		loaded,
    		loadData,
    		loadRepos
    	});

    	$$self.$inject_state = $$props => {
    		if ("devices" in $$props) $$invalidate(0, devices = $$props.devices);
    		if ("repos" in $$props) $$invalidate(1, repos = $$props.repos);
    		if ("pressed" in $$props) $$invalidate(2, pressed = $$props.pressed);
    		if ("loaded" in $$props) $$invalidate(3, loaded = $$props.loaded);
    		if ("loadData" in $$props) $$invalidate(4, loadData = $$props.loadData);
    		if ("loadRepos" in $$props) loadRepos = $$props.loadRepos;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [devices, repos, pressed, loaded, loadData];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            name: 'world'
        }
    });

    return app;

}());
