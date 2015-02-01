/*global $, jQuery, localStorage, window, angular, alert, document, console, confirm, require */
/*global Event */
/*jshint unused:false */
/*jshint plusplus: false, devel: true, nomen: true, indent: 4, maxerr: 50 */

/*	By Sten Hougaard, @netsi1964
	Version 0.01
	State: Alpha
*/

;(function (window, undefined) {
	Object.prototype.attr = function (get, value) {
		if ("getAttribute" in this) {
			if (arguments.length === 2) {
				return this.setAttribute(get, value);
			} else {
				return this.getAttribute(get);
			}
		} else {
			var attribute = this.attributes[get];
			if (typeof attribute !== "undefined") {
				if (arguments.length === 2) {
					if (typeof value !== "undefined") {
						return (attribute.value = value);
					} else {
						return undefined;
					}
				}
				return attribute.value;
			} else {
				return attribute;
			}
		}
	};


	// add event cross browser
	function addEvent(elem, event, fn) {
		// avoid memory overhead of new anonymous functions for every event handler that's installed
		// by using local functions
		function listenHandler(e) {
			var ret = fn.apply(this, arguments);
			if (ret === false) {
				e.stopPropagation();
				e.preventDefault();
			}
			return (ret);
		}

		function attachHandler() {
			// set the this pointer same as addEventListener when fn is called
			// and make sure the event is passed to the fn also so that works the same too
			var ret = fn.call(elem, window.event);
			if (ret === false) {
				window.event.returnValue = false;
				window.event.cancelBubble = true;
			}
			return (ret);
		}

		if (elem.addEventListener) {
			elem.addEventListener(event, listenHandler, false);
		} else {
			elem.attachEvent("on" + event, attachHandler);
		}
	}


	function getSubscribtionParameters(subscribtion, subscriberElement) {
		subscribtion.publishersSelector = subscriberElement.attr("data-subscribe");
		subscribtion.publisherAttribute = subscriberElement.attr("data-pub-attr") || "value";
		subscribtion.subscriberAttribute = subscriberElement.attr("data-sub-attr") || subscribtion.publisherAttribute;
		subscribtion.subscriberFunction = subscriberElement.attr("data-sub-func");
		if (typeof subscribtion.subscriberFunction !== "undefined") {
			subscribtion.subscriberFunction = window[subscribtion.subscriberFunction];
		}
		return subscribtion;
	}


	/**
	 * Setup an element as a subscriber
	 * A one way binding from an attribute on a specified publisher will be established
	 * Subscribtion can be setup using data-attributes:
	 * "data-subscribe"		: A selector to the publishers you want to subscribe to
	 * "data-pub-attr"		: Which attribute do you want to subscribe to? [optional] (default: value)
	 * 						  If omitted it will be "value"
	 * "data-sub-attr"		: Where should the subscribtion be bound to on the subscriber? [optional] (default: "data-pub-attr")
	 * 						  If omitted it will be same as "data-pub-attr.
	 * "data-sub-func"		: A function which will be called with the element, the new and the old value, allowing for manipulation of value
	 * "data-subscibe-as"	: A CSS selector, points to another element which has a subscribtion and reuses settings from that [optional]
	 * Example:
	 * <input data-pub="#search" data-pub-attr="value" data-sub-attr="value" />
	 * @param {Object} subscriberElement See above
	 */
	function subscribe(subscriberElement) {
		// TO-DO: Handle listnerElement to be selector, so subscribtions can be added using script
		// TO-DO: store eventlisteners so subscribtions can be removed and paused
		// TO-DO: Add custom events onsubscribtions related events for instance: "subscribed"
		// TO-DO: Option to bind to more values on subscriber "Change width and height when range#value changes"
		// TO-DO: Option to subscribe to text and html
		// TO-DO: Draw bindings using SVG on debug
		// TO-DO: Update event meta data on subscriber and publisher, like no of times published
		var that = {};
		that.subscriberElement = subscriberElement;
		that.subscibeId = new Date() - new Date(1964, 8, 23);

		that.subscribeAs = that.subscriberElement.attr("data-subscibe-as");
		if (typeof that.subscribeAs !== "undefined") {
			var subscribers = document.querySelector(that.subscribeAs);
			that.subscriberFunction = window[that.subscriberFunction];
			that = getSubscribtionParameters(that, subscriberElement);
		} else {
			that = getSubscribtionParameters(that, subscriberElement);
		}
		that.subscriberElement.attr("data-subscibe-id", that.subscibeId);

		that.publishers = document.querySelectorAll(that.publishersSelector);
		// console.log("Subscribtion where “" + that.subscriberAttribute + "” on element “" + that.subscriberElement + "” will be bound to " + that.publisherAttribute + " on “" + that.publishersSelector + "” (" + that.publishers.length + " publishers) ");
	[].forEach.call(that.publishers, function (ele) {
			addEvent(ele, "change", function (event) {
				var oldValue = subscriberElement.getAttribute(that.subscriberAttribute);
				var newValue = this[that.publisherAttribute];
				newValue = (typeof that.subscriberFunction !== "undefined") ? that.subscriberFunction.call(this, that.subscriberElement, newValue, oldValue) : newValue;
				subscriberElement.setAttribute(that.subscriberAttribute, newValue);
			});
			ele.dispatchEvent(changeEvent);
		});
	}

	var changeEvent = new Event("change");

	function init() {
	[].forEach.call(document.querySelectorAll("[data-subscribe], [data-subscibe-as]"), function (ele) {
			subscribe(ele);
		});
	}
	addEvent(window, "load", init);

})(window);