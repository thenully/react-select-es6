/**
 * Copyright (c) 2017 Thenully Inc.
 * react-select project is licensed under the MIT license
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import TextFieldLabel from './TextFieldLabel';
import transitions from './styles/transitions';

import defaultArrowRenderer from './utils/defaultArrowRenderer';
import defaultFilterOptions from './utils/defaultFilterOptions';
import defaultMenuRenderer from './utils/defaultMenuRenderer';
import defaultClearRenderer from './utils/defaultClearRenderer';

import Async from './Async';
import Option from './Option';
import Value from './Value';
import Creatable from './Creatable';

function stringifyValue (value) {
	const valueType = typeof value;
	if (valueType === 'string') {
		return value;
	} else if (valueType === 'object') {
		return JSON.stringify(value);
	} else if (valueType === 'number' || valueType === 'boolean') {
		return String(value);
	} else {
		return '';
	}
}

function isValid(value) {
	return value !== '' && value !== undefined && value !== null && !(Array.isArray(value) && value.length === 0);
}

const getStyles = (props, state) => {
	const styles = {
		floatingLabel: {
			color: '#cdcdcd',
			pointerEvents: 'none',
		},
		error: {
			position: 'absolute',
			fontSize: 11,
			fontWeight: 'normal',
			lineHeight: '1',
			bottom: '-20px',
			textAlign: 'left',
			color: '#f92020',
			transition: transitions.easeOut(),
		},
	};

	styles.textarea = Object.assign({}, styles.input, {
		marginTop: props.floatingLabelText ? 36 : 12,
		marginBottom: props.floatingLabelText ? -36 : -12,
		boxSizing: 'border-box',
		font: 'inherit',
	});

	// Do not assign a height to the textarea as he handles it on his own.
	if (state.isFocused || state.hasValue) {
		styles.floatingLabel.color = '#1d1d1d';
	}

	return styles;
};

const stringOrNode = PropTypes.oneOfType([
	PropTypes.string,
	PropTypes.node
]);

let instanceId = 1;

const propTypes = {
	addLabelText: PropTypes.string,       // placeholder displayed when you want to add a label on a multi-value input
	'aria-describedby': PropTypes.string,	// HTML ID(s) of element(s) that should be used to describe this input (for assistive tech)
	'aria-label': PropTypes.string,       // Aria label (for assistive tech)
	'aria-labelledby': PropTypes.string,	// HTML ID of an element that should be used as the label (for assistive tech)
	arrowRenderer: PropTypes.func,				// Create drop-down caret element
	autoBlur: PropTypes.bool,             // automatically blur the component when an option is selected
	autofocus: PropTypes.bool,            // autofocus the component on mount
	autosize: PropTypes.bool,             // whether to enable autosizing or not
	backspaceRemoves: PropTypes.bool,     // whether backspace removes an item if there is no text input
	backspaceToRemoveMessage: PropTypes.string,  // Message to use for screenreaders to press backspace to remove the current item - {label} is replaced with the item label
	className: PropTypes.string,          // className for the outer element
	clearAllText: stringOrNode,                 // title for the "clear" control when multi: true
	clearRenderer: PropTypes.func,        // create clearable x element
	clearValueText: stringOrNode,               // title for the "clear" control
	clearable: PropTypes.bool,            // should it be possible to reset value
	deleteRemoves: PropTypes.bool,        // whether backspace removes an item if there is no text input
	delimiter: PropTypes.string,          // delimiter to use to join multiple values for the hidden field value
	disabled: PropTypes.bool,             // whether the Select is disabled or not
	escapeClearsValue: PropTypes.bool,    // whether escape clears the value when the menu is closed
	filterOption: PropTypes.func,         // method to filter a single option (option, filterString)
	filterOptions: PropTypes.any,         // boolean to enable default filtering or function to filter the options array ([options], filterString, [values])
	ignoreCase: PropTypes.bool,           // whether to perform case-insensitive filtering
	inputProps: PropTypes.object,         // custom attributes for the Input
	inputRenderer: PropTypes.func,        // returns a custom input component
	instanceId: PropTypes.string,         // set the components instanceId
	isLoading: PropTypes.bool,            // whether the Select is loading externally or not (such as options being loaded)
	joinValues: PropTypes.bool,           // joins multiple values into a single form field with the delimiter (legacy mode)
	labelKey: PropTypes.string,           // path of the label value in option objects
	matchPos: PropTypes.string,           // (any|start) match the start or entire string when filtering
	matchProp: PropTypes.string,          // (any|label|value) which option property to filter on
	menuBuffer: PropTypes.number,         // optional buffer (in px) between the bottom of the viewport and the bottom of the menu
	menuContainerStyle: PropTypes.object, // optional style to apply to the menu container
	menuRenderer: PropTypes.func,         // renders a custom menu with options
	menuStyle: PropTypes.object,          // optional style to apply to the menu
	multi: PropTypes.bool,                // multi-value input
	name: PropTypes.string,               // generates a hidden <input /> tag with this field name for html forms
	noResultsText: stringOrNode,                // placeholder displayed when there are no matching search results
	onBlur: PropTypes.func,               // onBlur handler: function (event) {}
	onBlurResetsInput: PropTypes.bool,    // whether input is cleared on blur
	onChange: PropTypes.func,             // onChange handler: function (newValue) {}
	onClose: PropTypes.func,              // fires when the menu is closed
	onCloseResetsInput: PropTypes.bool,		// whether input is cleared when menu is closed through the arrow
	onFocus: PropTypes.func,              // onFocus handler: function (event) {}
	onInputChange: PropTypes.func,        // onInputChange handler: function (inputValue) {}
	onInputKeyDown: PropTypes.func,       // input keyDown handler: function (event) {}
	onMenuScrollToBottom: PropTypes.func, // fires when the menu is scrolled to the bottom; can be used to paginate options
	onOpen: PropTypes.func,               // fires when the menu is opened
	onValueClick: PropTypes.func,         // onClick handler for value labels: function (value, event) {}
	openAfterFocus: PropTypes.bool,       // boolean to enable opening dropdown when focused
	openOnFocus: PropTypes.bool,          // always open options menu on focus
	optionClassName: PropTypes.string,    // additional class(es) to apply to the <Option /> elements
	optionComponent: PropTypes.func,      // option component to render in dropdown
	optionRenderer: PropTypes.func,       // optionRenderer: function (option) {}
	options: PropTypes.array,             // array of options
	pageSize: PropTypes.number,           // number of entries to page when using page up/down keys
	placeholder: stringOrNode,                  // field placeholder, displayed when there's no value
	required: PropTypes.bool,             // applies HTML5 required attribute when needed
	resetValue: PropTypes.any,            // value to use when you clear the control
	scrollMenuIntoView: PropTypes.bool,   // boolean to enable the viewport to shift so that the full menu fully visible when engaged
	searchable: PropTypes.bool,           // whether to enable searching feature or not
	simpleValue: PropTypes.bool,          // pass the value to onChange as a simple value (legacy pre 1.0 mode), defaults to false
	style: PropTypes.object,              // optional style to apply to the control
	tabIndex: PropTypes.string,           // optional tab index of the control
	tabSelectsValue: PropTypes.bool,      // whether to treat tabbing out while focused to be value selection
	value: PropTypes.any,                 // initial field value
	valueComponent: PropTypes.func,       // value component to render
	valueKey: PropTypes.string,           // path of the label value in option objects
	valueRenderer: PropTypes.func,        // valueRenderer: function (option) {}
	wrapperStyle: PropTypes.object,       // optional style to apply to the component wrapper
	inputWrapperStyle: PropTypes.object,	// optional style to apply to the input wrapper
	inputStyle: PropTypes.object,					// optional style to apply to the input
	hideArrow: PropTypes.bool,						// whether arrow icon is hidden or not
	floatingLabelFixed: PropTypes.bool,
	floatingLabelFocusStyle: PropTypes.object,
	floatingLabelShrinkStyle: PropTypes.object,
	floatingLabelStyle: PropTypes.object,
	floatingLabelText: PropTypes.node,		// title for the error element
	errorClassName: PropTypes.string,			// className for the error element
	errorStyle: PropTypes.object,					// optional style to apply to the error element
	errorText: PropTypes.node,						// title for the error element

};
const defaultProps = {
	addLabelText: 'Add "{label}"?',
	arrowRenderer: defaultArrowRenderer,
	autosize: true,
	backspaceRemoves: true,
	backspaceToRemoveMessage: 'Press backspace to remove {label}',
	clearable: true,
	clearAllText: 'Clear all',
	clearRenderer: defaultClearRenderer,
	clearValueText: 'Clear value',
	deleteRemoves: true,
	delimiter: ',',
	disabled: false,
	escapeClearsValue: true,
	filterOptions: defaultFilterOptions,
	ignoreCase: true,
	inputProps: {},
	isLoading: false,
	joinValues: false,
	labelKey: 'label',
	matchPos: 'any',
	matchProp: 'any',
	menuBuffer: 0,
	menuRenderer: defaultMenuRenderer,
	multi: false,
	noResultsText: 'No results found',
	onBlurResetsInput: true,
	onCloseResetsInput: true,
	optionComponent: Option,
	pageSize: 5,
	placeholder: 'Select...',
	required: false,
	scrollMenuIntoView: true,
	searchable: true,
	simpleValue: false,
	tabSelectsValue: true,
	valueComponent: Value,
	valueKey: 'value',
	hideArrow: false,
};

class Select extends Component {
	constructor(props) {
		super(props);
		this.state = {
			inputValue: '',
			isFocused: false,
			isOpen: false,
			isPseudoFocused: false,
			required: false,
			hasValue: false,
			errorText: undefined,
		};
		this.handleTouchOutside = this.handleTouchOutside.bind(this);
		this.focus = this.focus.bind(this);
		this.blurInput = this.blurInput.bind(this);
		this.handleTouchMove = this.handleTouchMove.bind(this);
		this.handleTouchStart = this.handleTouchStart.bind(this);
		this.handleTouchEnd = this.handleTouchEnd.bind(this);
		this.handleTouchEndClearValue = this.handleTouchEndClearValue.bind(this);
		this.handleMouseDown = this.handleMouseDown.bind(this);
		this.handleMouseDownOnArrow = this.handleMouseDownOnArrow.bind(this);
		this.handleMouseDownOnMenu = this.handleMouseDownOnMenu.bind(this);
		this.closeMenu = this.closeMenu.bind(this);
		this.handleInputFocus = this.handleInputFocus.bind(this);
		this.handleInputBlur = this.handleInputBlur.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleValueClick = this.handleValueClick.bind(this);
		this.handleMenuScroll = this.handleMenuScroll.bind(this);
		this.getOptionLabel = this.getOptionLabel.bind(this);
		this.getValueArray = this.getValueArray.bind(this);
		this.setValue = this.setValue.bind(this);
		this.selectValue = this.selectValue.bind(this);
		this.addValue = this.addValue.bind(this);
		this.popValue = this.popValue.bind(this);
		this.removeValue = this.removeValue.bind(this);
		this.clearValue = this.clearValue.bind(this);
		this.removeValue = this.removeValue.bind(this);
		this.getResetValue = this.getResetValue.bind(this);
		this.focusOption = this.focusOption.bind(this);
		this.focusNextOption = this.focusNextOption.bind(this);
		this.focusPreviousOption = this.focusPreviousOption.bind(this);
		this.focusPageUpOption = this.focusPageUpOption.bind(this);
		this.focusPageDownOption = this.focusPageDownOption.bind(this);
		this.focusStartOption = this.focusStartOption.bind(this);
		this.focusEndOption = this.focusEndOption.bind(this);
		this.focusAdjacentOption = this.focusAdjacentOption.bind(this);
		this.getFocusedOption = this.getFocusedOption.bind(this);
		this.getInputValue = this.getInputValue.bind(this);
		this.selectFocusedOption = this.selectFocusedOption.bind(this);
		this.filterOptions = this.filterOptions.bind(this);
		this.onOptionRef = this.onOptionRef.bind(this);
		this.renderFloatingLabel = this.renderFloatingLabel.bind(this);
		this.renderLoading = this.renderLoading.bind(this);
		this.renderErrorText = this.renderErrorText.bind(this);
		this.renderValue = this.renderValue.bind(this);
		this.renderInput = this.renderInput.bind(this);
		this.renderClear = this.renderClear.bind(this);
		this.renderArrow = this.renderArrow.bind(this);
		this.renderMenu = this.renderMenu.bind(this);
		this.renderHiddenField = this.renderHiddenField.bind(this);
		this.getFocusableOptionIndex = this.getFocusableOptionIndex.bind(this);
		this.renderOuter = this.renderOuter.bind(this);
	}

	componentWillMount () {
		this._instancePrefix = 'react-select-' + (this.props.instanceId || ++instanceId) + '-';
		const valueArray = this.getValueArray(this.props.value);

		if (this.props.required) {
			this.setState({
				required: this.handleRequired(valueArray[0], this.props.multi),
				hasValue: isValid(this.props.value),
				errorText: this.props.errorText,
			});
		}
	}

	componentDidMount () {
		if (this.props.autofocus) {
			this.focus();
		}
	}

	componentWillReceiveProps (nextProps) {
		const valueArray = this.getValueArray(nextProps.value, nextProps);

		if (nextProps.required) {
			this.setState({
				required: this.handleRequired(valueArray[0], nextProps.multi),
				hasValue: isValid(nextProps.value),
				errorText: nextProps.errorText,
			});
		}
	}

	componentWillUpdate (nextProps, nextState) {
		if (nextState.isOpen !== this.state.isOpen) {
			this.toggleTouchOutsideEvent(nextState.isOpen);
			const handler = nextState.isOpen ? nextProps.onOpen : nextProps.onClose;
			handler && handler();
		}
	}

	componentDidUpdate (prevProps, prevState) {
		// focus to the selected option
		if (this.menu && this.state.focused && this.state.isOpen && !this.hasScrolledToOption) {
			let focusedOptionNode = ReactDOM.findDOMNode(this.state.focused);
			let menuNode = ReactDOM.findDOMNode(this.menu);
			menuNode.scrollTop = focusedOptionNode.offsetTop;
			this.hasScrolledToOption = true;
		} else if (!this.state.isOpen) {
			this.hasScrolledToOption = false;
		}

		if (this._scrollToFocusedOptionOnUpdate && this.state.focused && this.menu) {
			this._scrollToFocusedOptionOnUpdate = false;
			let focusedDOM = ReactDOM.findDOMNode(this.state.focused);
			let menuDOM = ReactDOM.findDOMNode(this.menu);
			let focusedRect = focusedDOM.getBoundingClientRect();
			let menuRect = menuDOM.getBoundingClientRect();
			if (focusedRect.bottom > menuRect.bottom || focusedRect.top < menuRect.top) {
				menuDOM.scrollTop = (focusedDOM.offsetTop + focusedDOM.clientHeight - menuDOM.offsetHeight);
			}
		}
		if (this.props.scrollMenuIntoView && this.menuContainer) {
			let menuContainerRect = this.menuContainer.getBoundingClientRect();
			if (window.innerHeight < menuContainerRect.bottom + this.props.menuBuffer) {
				window.scrollBy(0, menuContainerRect.bottom + this.props.menuBuffer - window.innerHeight);
			}
		}
		if (prevProps.disabled !== this.props.disabled) {
			this.setState({ isFocused: false }); // eslint-disable-line react/no-did-update-set-state
			this.closeMenu();
		}
	}

	componentWillUnmount () {
		if (!document.removeEventListener && document.detachEvent) {
			document.detachEvent('ontouchstart', this.handleTouchOutside);
		} else {
			document.removeEventListener('touchstart', this.handleTouchOutside);
		}
	}

	toggleTouchOutsideEvent (enabled) {
		if (enabled) {
			if (!document.addEventListener && document.attachEvent) {
				document.attachEvent('ontouchstart', this.handleTouchOutside);
			} else {
				document.addEventListener('touchstart', this.handleTouchOutside);
			}
		} else {
			if (!document.removeEventListener && document.detachEvent) {
				document.detachEvent('ontouchstart', this.handleTouchOutside);
			} else {
				document.removeEventListener('touchstart', this.handleTouchOutside);
			}
		}
	}

	handleTouchOutside (event) {
		// handle touch outside on ios to dismiss menu
		if (this.wrapper && !this.wrapper.contains(event.target)) {
			this.closeMenu();
		}
	}

	focus () {
		if (!this.input) return;
		this.input.focus();
	}

	blurInput () {
		if (!this.input) return;
		this.input.blur();
	}

	handleTouchMove (event) {
		// Set a flag that the view is being dragged
		this.dragging = true;
	}

	handleTouchStart (event) {
		// Set a flag that the view is not being dragged
		this.dragging = false;
	}

	handleTouchEnd (event) {
		// Check if the view is being dragged, In this case
		// we don't want to fire the click event (because the user only wants to scroll)
		if (this.dragging) return;

		// Fire the mouse events
		this.handleMouseDown(event);
	}

	handleTouchEndClearValue (event) {
		// Check if the view is being dragged, In this case
		// we don't want to fire the click event (because the user only wants to scroll)
		if (this.dragging) return;

		// Clear the value
		this.clearValue(event);
	}

	handleMouseDown (event) {
		// if the event was triggered by a mousedown and not the primary
		// button, or if the component is disabled, ignore it.
		if (this.props.disabled || (event.type === 'mousedown' && event.button !== 0)) {
			return;
		}

		if (event.target.tagName === 'INPUT') {
			return;
		}

		// prevent default event handlers
		event.stopPropagation();
		event.preventDefault();

		// for the non-searchable select, toggle the menu
		if (!this.props.searchable) {
			this.focus();
			return this.setState({
				isOpen: !this.state.isOpen,
			});
		}

		if (this.state.isFocused) {
			// On iOS, we can get into a state where we think the input is focused but it isn't really,
			// since iOS ignores programmatic calls to input.focus() that weren't triggered by a click event.
			// Call focus() again here to be safe.
			this.focus();

			let input = this.input;
			if (typeof input.getInput === 'function') {
				// Get the actual DOM input if the ref is an <AutosizeInput /> component
				input = input.getInput();
			}

			// clears the value so that the cursor will be at the end of input when the component re-renders
			input.value = '';

			// if the input is focused, ensure the menu is open
			this.setState({
				isOpen: true,
				isPseudoFocused: false,
			});
		} else {
			// otherwise, focus the input and open the menu
			this._openAfterFocus = true;
			this.focus();
		}
	}

	handleMouseDownOnArrow (event) {
		// if the event was triggered by a mousedown and not the primary
		// button, or if the component is disabled, ignore it.
		if (this.props.disabled || (event.type === 'mousedown' && event.button !== 0)) {
			return;
		}
		// If the menu isn't open, let the event bubble to the main handleMouseDown
		if (!this.state.isOpen) {
			return;
		}
		// prevent default event handlers
		event.stopPropagation();
		event.preventDefault();
		// close the menu
		this.closeMenu();
	}

	handleMouseDownOnMenu (event) {
		// if the event was triggered by a mousedown and not the primary
		// button, or if the component is disabled, ignore it.
		if (this.props.disabled || (event.type === 'mousedown' && event.button !== 0)) {
			return;
		}
		event.stopPropagation();
		event.preventDefault();

		this._openAfterFocus = true;
		this.focus();
	}

	closeMenu () {
		if(this.props.onCloseResetsInput) {
			this.setState({
				isOpen: false,
				isPseudoFocused: this.state.isFocused && !this.props.multi,
				inputValue: ''
			});
		} else {
			this.setState({
				isOpen: false,
				isPseudoFocused: this.state.isFocused && !this.props.multi,
				inputValue: this.state.inputValue
			});
		}
		this.hasScrolledToOption = false;
	}

	handleInputFocus (event) {
		if (this.props.disabled) return;
		let isOpen = this.state.isOpen || this._openAfterFocus || this.props.openOnFocus;
		if (this.props.onFocus) {
			this.props.onFocus(event);
		}
		this.setState({
			isFocused: true,
			isOpen: isOpen
		});
		this._openAfterFocus = false;
	}

	handleInputBlur (event) {
		// The check for menu.contains(activeElement) is necessary to prevent IE11's scrollbar from closing the menu in certain contexts.
		// if (this.menu && (this.menu === document.activeElement || this.menu.contains(document.activeElement))) {
		// 	this.focus();
		// 	return;
		// }

		if (this.props.onBlur) {
			this.props.onBlur(event);
		}
		let onBlurredState = {
			isFocused: false,
			isOpen: false,
			isPseudoFocused: false,
		};
		if (this.props.onBlurResetsInput) {
			onBlurredState.inputValue = '';
		}
		this.setState(onBlurredState);
	}

	handleInputChange (event) {
		let newInputValue = event.target.value;

		if (this.state.inputValue !== event.target.value && this.props.onInputChange) {
			let nextState = this.props.onInputChange(newInputValue);
			// Note: != used deliberately here to catch undefined and null
			if (nextState != null && typeof nextState !== 'object') {
				newInputValue = '' + nextState;
			}
		}

		this.setState({
			isOpen: true,
			isPseudoFocused: false,
			inputValue: newInputValue,
			hasValue: isValid(newInputValue),
		});
	}

	handleKeyDown (event) {
		if (this.props.disabled) return;

		if (typeof this.props.onInputKeyDown === 'function') {
			this.props.onInputKeyDown(event);
			if (event.defaultPrevented) {
				return;
			}
		}

		switch (event.keyCode) {
			case 8: // backspace
				if (!this.state.inputValue && this.props.backspaceRemoves) {
					event.preventDefault();
					this.popValue();
				}
				return;
			case 9: // tab
				if (event.shiftKey || !this.state.isOpen || !this.props.tabSelectsValue) {
					return;
				}
				this.selectFocusedOption();
				return;
			case 13: // enter
				if (!this.state.isOpen) return;
				event.stopPropagation();
				this.selectFocusedOption();
				break;
			case 27: // escape
				if (this.state.isOpen) {
					this.closeMenu();
					event.stopPropagation();
				} else if (this.props.clearable && this.props.escapeClearsValue) {
					this.clearValue(event);
					event.stopPropagation();
				}
				break;
			case 38: // up
				this.focusPreviousOption();
				break;
			case 40: // down
				this.focusNextOption();
				break;
			case 33: // page up
				this.focusPageUpOption();
				break;
			case 34: // page down
				this.focusPageDownOption();
				break;
			case 35: // end key
				if (event.shiftKey) {
					return;
				}
				this.focusEndOption();
				break;
			case 36: // home key
				if (event.shiftKey) {
					return;
				}
				this.focusStartOption();
				break;
			case 46: // backspace
				if (!this.state.inputValue && this.props.deleteRemoves) {
					event.preventDefault();
					this.popValue();
				}
				return;
			default: return;
		}
		event.preventDefault();
	}

	handleValueClick (option, event) {
		if (!this.props.onValueClick) return;
		this.props.onValueClick(option, event);
	}

	handleMenuScroll (event) {
		if (!this.props.onMenuScrollToBottom) return;
		let { target } = event;
		if (target.scrollHeight > target.offsetHeight && !(target.scrollHeight - target.offsetHeight - target.scrollTop)) {
			this.props.onMenuScrollToBottom();
		}
	}

	handleRequired (value, multi) {
		if (!value) return true;
		return (multi ? value.length === 0 : Object.keys(value).length === 0);
	}

	getOptionLabel (op) {
		return op[this.props.labelKey];
	}

	/**
	 * Turns a value into an array from the given options
	 * @param	{String|Number|Array}	value		- the value of the select input
	 * @param	{Object}		nextProps	- optionally specify the nextProps so the returned array uses the latest configuration
	 * @returns	{Array}	the value of the select represented in an array
	 */
	getValueArray (value, nextProps) {
		/** support optionally passing in the `nextProps` so `componentWillReceiveProps` updates will function as expected */
		const props = typeof nextProps === 'object' ? nextProps : this.props;
		if (props.multi) {
			if (typeof value === 'string') value = value.split(props.delimiter);
			if (!Array.isArray(value)) {
				if (value === null || value === undefined) return [];
				value = [value];
			}
			return value.map(value => this.expandValue(value, props)).filter(i => i);
		}
		let expandedValue = this.expandValue(value, props);
		return expandedValue ? [expandedValue] : [];
	}

	/**
	 * Retrieve a value from the given options and valueKey
	 * @param	{String|Number|Array}	value	- the selected value(s)
	 * @param	{Object}		props	- the Select component's props (or nextProps)
	 */
	expandValue (value, props) {
		const valueType = typeof value;
		if (valueType !== 'string' && valueType !== 'number' && valueType !== 'boolean') return value;
		let { options, valueKey } = props;
		if (!options) return;
		for (let i = 0; i < options.length; i++) {
			if (options[i][valueKey] === value) return options[i];
		}
	}

	setValue (value) {
		if (this.props.autoBlur){
			this.blurInput();
		}
		if (!this.props.onChange) return;
		if (this.props.required) {
			const required = this.handleRequired(value, this.props.multi);
			this.setState({ required });
		}
		if (this.props.simpleValue && value) {
			value = this.props.multi ? value.map(i => i[this.props.valueKey]).join(this.props.delimiter) : value[this.props.valueKey];
		}
		this.props.onChange(value);
	}

	selectValue (value) {
		//NOTE: update value in the callback to make sure the input value is empty so that there are no styling issues (Chrome had issue otherwise)
		this.hasScrolledToOption = false;
		if (this.props.multi) {
			this.setState({
				inputValue: '',
				focusedIndex: null
			}, () => {
				this.addValue(value);
			});
		} else {
			this.setState({
				isOpen: false,
				inputValue: '',
				isPseudoFocused: this.state.isFocused,
			}, () => {
				this.setValue(value);
			});
		}
	}

	addValue (value) {
		let valueArray = this.getValueArray(this.props.value);
		const visibleOptions = this._visibleOptions.filter(val => !val.disabled);
		const lastValueIndex = visibleOptions.indexOf(value);
		this.setValue(valueArray.concat(value));
		if (visibleOptions.length - 1 === lastValueIndex) {
			// the last option was selected; focus the second-last one
			this.focusOption(visibleOptions[lastValueIndex - 1]);
		} else if (visibleOptions.length > lastValueIndex) {
			// focus the option below the selected one
			this.focusOption(visibleOptions[lastValueIndex + 1]);
		}
	}

	popValue () {
		let valueArray = this.getValueArray(this.props.value);
		if (!valueArray.length) return;
		if (valueArray[valueArray.length-1].clearableValue === false) return;
		this.setValue(valueArray.slice(0, valueArray.length - 1));
	}

	removeValue (value) {
		let valueArray = this.getValueArray(this.props.value);
		this.setValue(valueArray.filter(i => i !== value));
		this.focus();
	}

	clearValue (event) {
		// if the event was triggered by a mousedown and not the primary
		// button, ignore it.
		if (event && event.type === 'mousedown' && event.button !== 0) {
			return;
		}
		event.stopPropagation();
		event.preventDefault();
		this.setValue(this.getResetValue());
		this.setState({
			isOpen: false,
			inputValue: '',
		}, this.focus);
	}

	getResetValue () {
		if (this.props.resetValue !== undefined) {
			return this.props.resetValue;
		} else if (this.props.multi) {
			return [];
		} else {
			return null;
		}
	}

	focusOption (option) {
		this.setState({
			focusedOption: option
		});
	}

	focusNextOption () {
		this.focusAdjacentOption('next');
	}

	focusPreviousOption () {
		this.focusAdjacentOption('previous');
	}

	focusPageUpOption () {
		this.focusAdjacentOption('page_up');
	}

	focusPageDownOption () {
		this.focusAdjacentOption('page_down');
	}

	focusStartOption () {
		this.focusAdjacentOption('start');
	}

	focusEndOption () {
		this.focusAdjacentOption('end');
	}

	focusAdjacentOption (dir) {
		let options = this._visibleOptions
		.map((option, index) => ({ option, index }))
		.filter(option => !option.option.disabled);
		this._scrollToFocusedOptionOnUpdate = true;
		if (!this.state.isOpen) {
			this.setState({
				isOpen: true,
				inputValue: '',
				focusedOption: this._focusedOption || (options.length ? options[dir === 'next' ? 0 : options.length - 1].option : null)
			});
			return;
		}
		if (!options.length) return;
		let focusedIndex = -1;
		for (let i = 0; i < options.length; i++) {
			if (this._focusedOption === options[i].option) {
				focusedIndex = i;
				break;
			}
		}
		if (dir === 'next' && focusedIndex !== -1 ) {
			focusedIndex = (focusedIndex + 1) % options.length;
		} else if (dir === 'previous') {
			if (focusedIndex > 0) {
				focusedIndex = focusedIndex - 1;
			} else {
				focusedIndex = options.length - 1;
			}
		} else if (dir === 'start') {
			focusedIndex = 0;
		} else if (dir === 'end') {
			focusedIndex = options.length - 1;
		} else if (dir === 'page_up') {
			let potentialIndex = focusedIndex - this.props.pageSize;
			if (potentialIndex < 0) {
				focusedIndex = 0;
			} else {
				focusedIndex = potentialIndex;
			}
		} else if (dir === 'page_down') {
			let potentialIndex = focusedIndex + this.props.pageSize;
			if (potentialIndex > options.length - 1) {
				focusedIndex = options.length - 1;
			} else {
				focusedIndex = potentialIndex;
			}
		}

		if (focusedIndex === -1) {
			focusedIndex = 0;
		}

		this.setState({
			focusedIndex: options[focusedIndex].index,
			focusedOption: options[focusedIndex].option
		});
	}

	getFocusedOption () {
		return this._focusedOption;
	}

	getInputValue () {
		return this.state.inputValue;
	}

	selectFocusedOption () {
		if (this._focusedOption) {
			return this.selectValue(this._focusedOption);
		}
	}
	
	renderLoading () {
		if (!this.props.isLoading) return;

		return (
			<span className="Select-loading-zone">
				<span className="Select-loading" />
			</span>
		);
	}

	renderFloatingLabel() {
		if (!this.props.floatingLabelText) return;

		const styles = getStyles(this.props, this.state);

		return (
			<TextFieldLabel
				style={Object.assign(
					styles.floatingLabel,
					this.props.floatingLabelStyle,
					this.state.hasValue || this.state.isFocused ? this.props.floatingLabelFocusStyle : null
				)}
				shrinkStyle={this.props.floatingLabelShrinkStyle}
				htmlFor="TextFieldLabel"
				shrink={this.state.hasValue || this.state.isFocused || this.props.floatingLabelFixed}
				disabled={this.props.disabled}
			>
				{this.props.floatingLabelText}
			</TextFieldLabel>
		);
	}

	renderErrorText() {
		if (!this.props.errorText) return;
		const styles = getStyles(this.props, this.state);
		return (
			<label className={this.props.errorClassName} style={Object.assign(styles.error, this.props.errorStyle)}>
				{this.props.errorText}
			</label>
		);
	}

	renderValue (valueArray, isOpen) {
		let renderLabel = this.props.valueRenderer || this.getOptionLabel;
		const ValueComponent = this.props.valueComponent;
		if (!valueArray.length) {
			if (this.props.floatingLabelText ) return null;

			return !this.state.inputValue ? <div className="Select-placeholder">{this.props.placeholder}</div> : null;
		}
		let onClick = this.props.onValueClick ? this.handleValueClick : null;
		if (this.props.multi) {
			return valueArray.map((value, i) => {
				// key={`value-${i}-${value[this.props.valueKey]}`}
				return (
					<ValueComponent
						id={this._instancePrefix + '-value-' + i}
						instancePrefix={this._instancePrefix}
						disabled={this.props.disabled || value.clearableValue === false}
						key={i}
						onClick={onClick}
						onRemove={this.removeValue}
						value={value}>
						{renderLabel(value, i)}
						<span className="Select-aria-only">&nbsp;</span>
					</ValueComponent>
				);
			});
		} else if (!this.state.inputValue) {
			if (isOpen) onClick = null;
			return (
				<ValueComponent
					id={this._instancePrefix + '-value-item'}
					disabled={this.props.disabled}
					instancePrefix={this._instancePrefix}
					onClick={onClick}
					value={valueArray[0]}
				>
					{renderLabel(valueArray[0])}
				</ValueComponent>
			);
		}
	}

	renderInput (valueArray, focusedOptionIndex) {
		let className = classNames('Select-input', this.props.inputProps.className);
		const isOpen = !!this.state.isOpen;

		const ariaOwns = classNames({
			[this._instancePrefix + '-list']: isOpen,
			[this._instancePrefix + '-backspace-remove-message']: this.props.multi
			&& !this.props.disabled
			&& this.state.isFocused
			&& !this.state.inputValue
		});

		// TODO: Check how this project includes Object.assign()
		const inputProps = Object.assign({}, this.props.inputProps, {
			role: 'combobox',
			'aria-expanded': '' + isOpen,
			'aria-owns': ariaOwns,
			'aria-haspopup': '' + isOpen,
			'aria-activedescendant': isOpen ? this._instancePrefix + '-option-' + focusedOptionIndex : this._instancePrefix + '-value',
			'aria-describedby': this.props['aria-describedby'],
			'aria-labelledby': this.props['aria-labelledby'],
			'aria-label': this.props['aria-label'],
			className: className,
			tabIndex: this.props.tabIndex,
			onBlur: this.handleInputBlur,
			onChange: this.handleInputChange,
			onFocus: this.handleInputFocus,
			ref: ref => this.input = ref,
			required: this.state.required,
			value: this.state.inputValue,
			style: this.props.inputStyle,
		});

		if (this.props.inputRenderer) {
			return this.props.inputRenderer(inputProps);
		}

		if (this.props.disabled || !this.props.searchable) {
			const { inputClassName, ...divProps } = this.props.inputProps;

			return (
				<div
					{...divProps}
					role="combobox"
					className={className}
					tabIndex={this.props.tabIndex || 0}
					onFocus={this.handleInputFocus}
					ref={node => this.input = node}
					style={{ border: 0, width: 1, display:'inline-block' }}/>
			);
		}

		return (
			<div className={ className } style={this.props.inputWrapperStyle}>
				<input {...inputProps} />
			</div>
		);
	}

	renderClear () {
		if (!this.props.clearable || this.props.value === undefined || this.props.value === null || this.props.multi && !this.props.value.length || this.props.disabled || this.props.isLoading) return;
		const clear = this.props.clearRenderer();

		return (
			<span className="Select-clear-zone" title={this.props.multi ? this.props.clearAllText : this.props.clearValueText}
						onMouseDown={this.clearValue}
						onTouchStart={this.handleTouchStart}
						onTouchMove={this.handleTouchMove}
						onTouchEnd={this.handleTouchEndClearValue}>
				{clear}
			</span>
		);
	}

	renderArrow () {
		if (this.props.hideArrow) return null;

		const onMouseDown = this.handleMouseDownOnArrow;
		const isOpen = this.state.isOpen;
		const arrow = this.props.arrowRenderer({ onMouseDown, isOpen });

		return (
			<span
				className="Select-arrow-zone"
				onMouseDown={onMouseDown}>
				{arrow}
			</span>
		);
	}

	filterOptions (excludeOptions) {
		let filterValue = this.state.inputValue;
		let options = this.props.options || [];
		if (this.props.filterOptions) {
			// Maintain backwards compatibility with boolean attribute
			const filterOptions = typeof this.props.filterOptions === 'function'
				? this.props.filterOptions
				: defaultFilterOptions;

			return filterOptions(
				options,
				filterValue,
				excludeOptions,
				{
					filterOption: this.props.filterOption,
					ignoreCase: this.props.ignoreCase,
					labelKey: this.props.labelKey,
					matchPos: this.props.matchPos,
					matchProp: this.props.matchProp,
					valueKey: this.props.valueKey,
				}
			);
		} else {
			return options;
		}
	}

	onOptionRef(ref, isFocused) {
		if (isFocused) {
			this.state.focused = ref;
		}
	}

	renderMenu (options, valueArray, focusedOption) {
		if (options && options.length) {
			return this.props.menuRenderer({
				focusedOption,
				focusOption: this.focusOption,
				instancePrefix: this._instancePrefix,
				labelKey: this.props.labelKey,
				onFocus: this.focusOption,
				onSelect: this.selectValue,
				optionClassName: this.props.optionClassName,
				optionComponent: this.props.optionComponent,
				optionRenderer: this.props.optionRenderer || this.getOptionLabel,
				options,
				selectValue: this.selectValue,
				valueArray,
				valueKey: this.props.valueKey,
				onOptionRef: this.onOptionRef,
			});
		} else if (this.props.noResultsText) {
			return (
				<div className="Select-noresults">
					{this.props.noResultsText}
				</div>
			);
		} else {
			return null;
		}
	}

	renderHiddenField (valueArray) {
		if (!this.props.name) return;
		if (this.props.joinValues) {
			let value = valueArray.map(i => stringifyValue(i[this.props.valueKey])).join(this.props.delimiter);
			return (
				<input
					type="hidden"
					ref={ref => this.value = ref}
					name={this.props.name}
					value={value}
					disabled={this.props.disabled} />
			);
		}
		return valueArray.map((item, index) => (
			<input key={'hidden.' + index}
						 type="hidden"
						 ref={'value' + index}
						 name={this.props.name}
						 value={stringifyValue(item[this.props.valueKey])}
						 disabled={this.props.disabled} />
		));
	}

	getFocusableOptionIndex (selectedOption) {
		let options = this._visibleOptions;
		if (!options.length) return null;

		const valueKey = this.props.valueKey;
		let focusedOption = this.state.focusedOption || selectedOption;
		if (focusedOption && !focusedOption.disabled) {
			let focusedOptionIndex = -1;
			options.some((option, index) => {
				const isOptionEqual = option[valueKey] === focusedOption[valueKey];
				if (isOptionEqual) {
					focusedOptionIndex = index;
				}
				return isOptionEqual;
			});
			if (focusedOptionIndex !== -1) {
				return focusedOptionIndex;
			}
		}

		for (let i = 0; i < options.length; i++) {
			if (!options[i].disabled) return i;
		}
		return null;
	}

	renderOuter (options, valueArray, focusedOption) {
		let menu = this.renderMenu(options, valueArray, focusedOption);
		if (!menu) {
			return null;
		}

		return (
			<div ref={ref => this.menuContainer = ref} className="Select-menu-outer" style={this.props.menuContainerStyle}>
				<div ref={ref => this.menu = ref} role="listbox" className="Select-menu" id={this._instancePrefix + '-list'}
						 style={this.props.menuStyle}
						 onScroll={this.handleMenuScroll}
						 onMouseDown={this.handleMouseDownOnMenu}>
					{menu}
				</div>
			</div>
		);
	}

	render () {
		let valueArray = this.getValueArray(this.props.value);
		let options = this._visibleOptions = this.filterOptions(this.props.multi ? this.getValueArray(this.props.value) : null);
		let isOpen = this.state.isOpen;
		if (this.props.multi && !options.length && valueArray.length && !this.state.inputValue) isOpen = false;
		const focusedOptionIndex = this.getFocusableOptionIndex(valueArray[0]);

		let focusedOption = null;
		if (focusedOptionIndex !== null) {
			focusedOption = this._focusedOption = options[focusedOptionIndex];
		} else {
			focusedOption = this._focusedOption = null;
		}
		let className = classNames('Select', this.props.className, {
			'Select--multi': this.props.multi,
			'Select--single': !this.props.multi,
			'is-clearable': this.props.clearable,
			'is-disabled': this.props.disabled,
			'is-focused': this.state.isFocused,
			'is-loading': this.props.isLoading,
			'is-open': isOpen,
			'is-pseudo-focused': this.state.isPseudoFocused,
			'is-searchable': this.props.searchable,
			'has-value': valueArray.length,
		});

		let removeMessage = null;
		if (this.props.multi &&
			!this.props.disabled &&
			valueArray.length &&
			!this.state.inputValue &&
			this.state.isFocused &&
			this.props.backspaceRemoves) {
			removeMessage = (
				<span id={this._instancePrefix + '-backspace-remove-message'} className="Select-aria-only">
					{this.props.backspaceToRemoveMessage.replace('{label}', valueArray[valueArray.length - 1][this.props.labelKey])}
				</span>
			);
		}

		return (
			<div ref={node => this.wrapper = node}
					 className={className}
					 style={this.props.wrapperStyle}>
				{this.renderHiddenField(valueArray)}
				<div ref={node => this.control = node}
						 className="Select-control"
						 style={this.props.style}
						 onKeyDown={this.handleKeyDown}
						 onMouseDown={this.handleMouseDown}
						 onTouchEnd={this.handleTouchEnd}
						 onTouchStart={this.handleTouchStart}
						 onTouchMove={this.handleTouchMove}>
					{this.renderFloatingLabel()}
					<span className="Select-multi-value-wrapper" id={this._instancePrefix + '-value'}>
						{this.renderValue(valueArray, isOpen)}
						{this.renderInput(valueArray, focusedOptionIndex)}
					</span>
					{removeMessage}
					{this.renderLoading()}
					{this.renderClear()}
					{this.renderArrow()}
				</div>
				{isOpen ? this.renderOuter(options, !this.props.multi ? valueArray : null, focusedOption) : null}
				{this.renderErrorText()}
			</div>
		);
	}
}

Select.propTypes = propTypes;
Select.defaultProps = defaultProps;
Select.Async = Async;
Select.Creatable = Creatable;

export default Select;
