/**
 * Marco Polo v@VERSION
 *
 * A jQuery autocomplete plugin for the discerning developer.
 *
 * https://github.com/jstayton/jquery-marcopolo
 *
 * Copyright 2011 by Justin Stayton
 * Released under the MIT License
 * http://en.wikipedia.org/wiki/MIT_License
 */
(function ($) {
  'use strict';

  // The cache spans all instances and is indexed by URL. This allows different
  // instances to pull the same cached results if their URLs match.
  var cache = {};

  // jQuery UI's Widget Factory provides an object-oriented plugin framework
  // that handles the common plumbing tasks.
  $.widget('mp.marcoPolo', {
    // Default options.
    options: {
      // Cache results. The default functions caches results over all instances, keyed by the URL.  Possible values:
      // true (default) - caches globally, keyed by URL
      // false - disable caching
      // object - functions: add, fetch called to add to or fetch from a results cache.
      cache: true,
      // Whether to compare the selected item against items displayed in the
      // results list. The selected item is highlighted if a match is found,
      // instead of the first item in the list (by default). Set this option to
      // 'true' if the data is a string; otherwise, specify the data object
      // attribute name to compare on.
      compare: false,
      // Additional data to be sent in the request query string.
      data: {},
      // The number of milliseconds to delay before firing a request after a
      // change is made to the input value.
      delay: 250,
      // Format the raw data that's returned from the ajax request. Useful for
      // further filtering the data or returning the array of results that's
      // embedded deeper in the object.
      formatData: null,
      // Format the text that's displayed when the ajax request fails. Setting
      // this option to 'null' or returning 'false' suppresses the message from
      // being displayed.
      formatError: function ($item, jqXHR, textStatus, errorThrown) {
        return '<em>Your search could not be completed at this time.</em>';
      },
      // Format the display of each item in the results list.
      formatItem: function (data, $item) {
        return data.title || data.name;
      },
      // Format the text that's displayed when the minimum number of characters
      // (specified with the 'minChars' option) hasn't been reached. Setting
      // this option to 'null' or returning 'false' suppresses the message from
      // being displayed.
      formatMinChars: function (minChars, $item) {
        return '<em>Your search must be at least <strong>' + minChars + '</strong> characters.</em>';
      },
      // Format the text that's displayed when there are no results returned
      // for the requested input value. Setting this option to 'null' or
      // returning 'false' suppresses the message from being displayed.
      formatNoResults: function (q, $item) {
        return '<em>No results for <strong>' + q + '</strong>.</em>';
      },
      // Whether to hide the results list when an item is selected. The results
      // list is still hidden when the input is blurred for any other reason.
      hideOnSelect: true,
      // Positioning a label over an input is a common design pattern
      // (sometimes referred to as 'overlabel') that unfortunately doesn't
      // work so well with all of the input focus/blur events that occur with
      // autocomplete. With this option, however, the hiding/showing of the
      // label is handled internally to provide a built-in solution to the
      // problem.
      label: null,
      // The minimum number of characters required before a request is fired.
      minChars: 1,
      // Called when the input value changes.
      onChange: null,
      // Called when the ajax request fails.
      onError: null,
      // Called when the input field receives focus.
      onFocus: null,
      // Called when the minimum number of characters (specified with the
      // 'minChars' option) hasn't been reached by the end of the 'delay'.
      onMinChars: null,
      // Called when there are no results returned for the request.
      onNoResults: null,
      // Called before the ajax request is made.
      onRequestBefore: null,
      // Called after the ajax request completes (success or error).
      onRequestAfter: null,
      // Called when there are results to be displayed.
      onResults: null,
      // Called when an item is selected from the results list or passed in
      // through the 'selected' option.
      onSelect: function (data, $item) {
        this.val(data.title || data.name);
      },
      // The name of the query string parameter that is set with the input
      // value.
      param: 'q',
      // Whether to clear the input value when no selection is made from the
      // results list.
      required: false,
      // The list items to make selectable.
      selectable: '*',
      // Prime the input with a selected item.
      selected: null,
      // The URL to GET request for the results.
      url: null
    },

    // Key code to key name mapping for easy reference.
    keys: {
      DOWN: 40,
      ENTER: 13,
      ESC: 27,
      UP: 38
    },

    // Initialize the plugin on an input.
    _create: function () {
      var self = this;

      // Create a more appropriately named alias for the input.
      self.$input = self.element.addClass('mp_input');

      // Create an empty list for displaying future results. Insert it directly
      // after the input element.
      self.$list = $('<ol class="mp_list" />')
                     .hide()
                     .insertAfter(self.$input);

      // The current 'autocomplete' value is remembered for when 'destroy' is
      // called and the input is returned to its original state.
      self.autocomplete = self.$input.attr('autocomplete');

      // Disable the browser's autocomplete functionality so that it doesn't
      // interfere with this plugin's results.
      self.$input.attr('autocomplete', 'off');

      // The ajax request to get results is stored in case the request needs to
      // be aborted before a response is returned.
      self.ajax = null;
      self.ajaxAborted = false;

      // A reference to this function is maintained for unbinding in the
      // 'destroy' method. This is necessary because the selector is so
      // generic (document).
      self.documentMouseup = null;

      // "Pseudo" focus includes any interaction with the pluggin, even if the
      // input has blurred.
      self.focusPseudo = false;

      // "Real" focus is strictly when the input has focus.
      self.focusReal = false;

      // Whether a mousedown event is triggered on a list item.
      self.mousedown = false;

      // The currently selected item.
      self.selected = null;

      // Whether the last selection was by mouseup.
      self.selectedMouseup = false;

      // The request buffer timer in case the timer needs to be aborted due to
      // another key press.
      self.timer = null;

      // The current input value for comparison.
      self.value = self.$input.val();

      // Bind the necessary events.
      self
        ._bindInput()
        ._bindList()
        ._bindDocument();

      self._initOptions();
    },

    // Set an option.
    _setOption: function (option, value) {
      // Required call to the parent where the new option value is saved.
      $.Widget.prototype._setOption.apply(this, arguments);

      this._initOptions(option, value);
    },

    // Initialize options that require a little extra work.
    _initOptions: function (option, value) {
      var self = this,
          options = {};

      // If no option is specified, initialize all options.
      if (typeof option === 'undefined') {
        options = self.options;
      }
      // Otherwise, initialize only the specified option.
      else {
        options[option] = value;
      }

      $.each(options, function (option, value) {
        switch (option) {
          case 'label':
            // Ensure that the 'label' is a jQuery object if a selector string
            // or plain DOM element is passed.
            self.options.label = $(value).addClass('mp_label');

            self._toggleLabel();

            break;

          case 'selected':
            self._select(value, null);

            break;

          case 'url':
            // If no 'url' option is specified, use the parent form's 'action'.
            if (!value) {
              self.options.url = self.$input.closest('form').attr('action');
            }

            break;

          case 'cache':
            // if true, use the default cache functions, otherwise it's an object with user supplied caching functions
            if (value === true) {
              self.options.cache = { add: self._cacheAdd, fetch: self._cacheFetch };
            }
        }
      });

      return self;
    },

    _cacheAdd: function(term, params, data, ui) {
      var cacheKey = ui.options.url + (ui.options.url.indexOf('?') === -1 ? '?' : '&') + $.param(params);
      cache[cacheKey] = data;
    },

    _cacheFetch: function(term, params, ui) {
      // Build the request URL with query string data to use as the cache
      // key.
      var cacheKey = ui.options.url + (ui.options.url.indexOf('?') === -1 ? '?' : '&') + $.param(params);
      return cache[cacheKey];
    },

    // Programmatically change the input value without triggering a search
    // request (use the 'search' method for that). If the value is different
    // than the current input value, the 'onChange' callback is fired.
    change: function (q) {
      var self = this;

      // Change the input value if a new value is specified.
      if (q !== self.value) {
        self.$input.val(q);

        self._change(q);

        if (self.focusPseudo) {
          // Clear out the existing results to prevent future stale results
          // in case the change is made while the input has focus.
          self
            ._cancelPendingRequest()
            ._hideAndEmptyList();
        }
        else {
          // Show or hide the label depending on if the input has a value.
          self._toggleLabel();
        }
      }
    },

    // Programmatically trigger a search request using the existing input value
    // or a new one.
    search: function (q) {
      var $input = this.$input;

      // Change the input value if a new value is specified. Otherwise, use the
      // existing input value.
      if (typeof q !== 'undefined') {
        $input.val(q);
      }

      // Focus on the input to start the request and enable keyboard
      // navigation (only available when the input has focus).
      $input.focus();
    },

    // Remove the autocomplete functionality and return the selected input
    // fields to their original state.
    destroy: function () {
      var self = this,
          options = self.options;

      // Remove the results list element.
      self.$list.remove();

      // Re-enable 'autocomplete' on the input if it was enabled initially.
      if (self.autocomplete !== 'off') {
        self.$input.removeAttr('autocomplete');
      }

      self.$input.removeClass('mp_input');

      if (options.label) {
        options.label.removeClass('mp_label');
      }

      // Remove the specific document 'mouseup' event for this instance.
      $(document).unbind('mouseup.marcoPolo', self.documentMouseup);

      // Parent destroy removes the input's data and events.
      $.Widget.prototype.destroy.apply(self, arguments);
    },

    // Get the results list element.
    list: function () {
      return this.$list;
    },

    // Bind the necessary events to the input.
    _bindInput: function () {
      var self = this,
          $input = self.$input,
          $list = self.$list;

      $input
        .bind('focus.marcoPolo', function () {
          // Do nothing if the input already has focus. This prevents
          // additional 'focus' events from initiating the same request.
          if (self.focusReal) {
            return;
          }

          // It's overly complicated to check if an input field has focus, so
          // "manually" keep track in the 'focus' and 'blur' events.
          self.focusPseudo = true;
          self.focusReal = true;

          self._toggleLabel();

          // If this focus is the result of a mouse selection (which re-focuses
          // on the input), ignore as if a blur never occurred.
          if (self.selectedMouseup) {
            self.selectedMouseup = false;
          }
          // For everything else, initiate a request.
          else {
            self._trigger('focus');

            self._request($input.val());
          }
        })
        .bind('keydown.marcoPolo', function (key) {
          var $highlighted = $();

          switch (key.which) {
            // Highlight the previous item.
            case self.keys.UP:
              // The default moves the cursor to the beginning or end of the
              // input value. Keep it in its current place.
              key.preventDefault();

              // Show the list if it has been hidden by ESC.
              self
                ._showList()
                ._highlightPrev();

              break;

            // Highlight the next item.
            case self.keys.DOWN:
              // The default moves the cursor to the beginning or end of the
              // input value. Keep it in its current place.
              key.preventDefault();

              // Show the list if it has been hidden by ESC.
              self
                ._showList()
                ._highlightNext();

              break;

            // Select the currently highlighted item.
            case self.keys.ENTER:
              // Prevent the form from submitting on enter.
              key.preventDefault();

              // Prevent selection if the list isn't visible.
              if (!$list.is(':visible')) {
                return;
              }

              $highlighted = self._highlighted();

              if ($highlighted.length) {
                self._select($highlighted.data('marcoPolo'), $highlighted);
              }

              break;

            // Hide the list.
            case self.keys.ESC:
              self
                ._cancelPendingRequest()
                ._hideList();

              break;
          }
        })
        .bind('keyup.marcoPolo', function (key) {
          // Check if the input value has changed. This prevents keys like CTRL
          // and SHIFT from firing a new request.
          if ($input.val() !== self.value) {
            self._request($input.val());
          }
        })
        .bind('blur.marcoPolo', function () {
          self.focusReal = false;

          // When an item in the results list is clicked, the input blur event
          // fires before the click event, causing the results list to become
          // hidden (code below). This 1ms timeout ensures that the click event
          // code fires before that happens.
          setTimeout(function () {
            // If the $list 'mousedown' event has fired without a 'mouseup'
            // event, wait for that before dismissing everything.
            if (!self.mousedown) {
              self.focusPseudo = false;

              self._dismiss();
            }
          }, 1);
        });

      return self;
    },

    // Bind the necessary events to the list.
    _bindList: function () {
      var self = this;

      self.$list
        .bind('mousedown.marcoPolo', function () {
          // Tracked for use in the input 'blur' event.
          self.mousedown = true;
        })
        .delegate('li.mp_selectable', 'mouseover', function () {
          self._addHighlight($(this));
        })
        .delegate('li.mp_selectable', 'mouseout', function () {
          self._removeHighlight($(this));
        })
        .delegate('li.mp_selectable', 'mouseup', function () {
          var $item = $(this);

          self._select($item.data('marcoPolo'), $item);

          // This event is tracked so that when 'focus' is called on the input
          // (below), a new request isn't fired.
          self.selectedMouseup = true;

          // Give focus back to the input for easy tabbing on to the next
          // field.
          self.$input.focus();
        });

      return self;
    },

    // Bind the necessary events to the document.
    _bindDocument: function () {
      var self = this;

      // A reference to this function is maintained for unbinding in the
      // 'destroy' method. This is necessary because the selector is so
      // generic (document).
      $(document).bind('mouseup.marcoPolo', self.documentMouseup = function () {
        // Tracked for use in the input 'blur' event.
        self.mousedown = false;

        // Ensure that everything is dismissed if anything other than the input
        // is clicked. (A click on a selectable list item is handled above,
        // before this code fires.)
        if (!self.focusReal && self.$list.is(':visible')) {
          self.focusPseudo = false;

          self._dismiss();
        }
      });

      return self;
    },

    // Show or hide the label (if one exists) depending on whether the input
    // has focus or a value.
    _toggleLabel: function () {
      var self = this,
          $label = self.options.label;

      if ($label.length) {
        if (self.focusPseudo || self.$input.val()) {
          $label.hide();
        }
        else {
          $label.show();
        }
      }

      return self;
    },

    // Get the first selectable item in the results list.
    _firstSelectableItem: function () {
      return this.$list.children('li.mp_selectable:visible:first');
    },

    // Get the last selectable item in the results list.
    _lastSelectableItem: function () {
      return this.$list.children('li.mp_selectable:visible:last');
    },

    // Get the currently highlighted item in the results list.
    _highlighted: function () {
      return this.$list.children('li.mp_highlighted');
    },

    // Remove the highlight class from the specified item.
    _removeHighlight: function ($item) {
      $item.removeClass('mp_highlighted');

      return this;
    },

    // Add the highlight class to the specified item.
    _addHighlight: function ($item) {
      // The current highlight is removed to ensure that only one item is
      // highlighted at a time.
      this._removeHighlight(this._highlighted());

      $item.addClass('mp_highlighted');

      return this;
    },

    // Highlight the first selectable item in the results list.
    _highlightFirst: function () {
      this._addHighlight(this._firstSelectableItem());

      return this;
    },

    // Highlight the item before the currently highlighted item.
    _highlightPrev: function () {
      var $highlighted = this._highlighted(),
          $prev = $highlighted.prevAll('li.mp_selectable:visible:first');

      // If there is no "previous" selectable item, continue at the list's end.
      if (!$prev.length) {
        $prev = this._lastSelectableItem();
      }

      this._addHighlight($prev);

      return this;
    },

    // Highlight the item after the currently highlighted item.
    _highlightNext: function () {
      var $highlighted = this._highlighted(),
          $next = $highlighted.nextAll('li.mp_selectable:visible:first');

      // If there is no "next" selectable item, continue at the list's
      // beginning.
      if (!$next.length) {
        $next = this._firstSelectableItem();
      }

      this._addHighlight($next);

      return this;
    },

    // Show the results list.
    _showList: function () {
      var $list = this.$list;

      // But only if there are results to be shown.
      if ($list.children().length) {
        $list.show();
      }

      return this;
    },

    // Hide the results list.
    _hideList: function () {
      this.$list.hide();

      return this;
    },

    // Hide and empty the results list.
    _hideAndEmptyList: function () {
      this.$list
        .hide()
        .empty();

      return this;
    },

    // Build the results list from a successful request that returned no data.
    _buildNoResultsList: function (q) {
      var self = this,
          $input = self.$input,
          $list = self.$list,
          options = self.options,
          $item = $('<li class="mp_no_results" />'),
          formatNoResults;

      // Fire 'formatNoResults' callback.
      formatNoResults = options.formatNoResults && options.formatNoResults.call($input, q, $item);

      if (formatNoResults) {
        $item.html(formatNoResults);
      }

      self._trigger('noResults', [q, $item]);

      // Displaying a "no results" message is optional. It isn't displayed if
      // the 'formatNoResults' callback returns a false value.
      if (formatNoResults) {
        $item.appendTo($list);

        self._showList();
      }
      else {
        self._hideList();
      }

      return self;
    },

    // Build the results list from a successful request that returned data.
    _buildResultsList: function (q, data) {
      var self = this,
          $input = self.$input,
          $list = self.$list,
          options = self.options,
          // The currently selected item data for use in comparison.
          selected = self.selected,
          // Whether to compare the currently selected item with the results. A
          // 'compare' setting key has to be specified, and there must be a
          // currently selected item.
          compare = options.compare && selected,
          compareCurrent,
          compareSelected,
          compareMatch = false,
          datum,
          $item = $(),
          formatItem;

      // Loop through each result and add it to the list.
      for (var i = 0; data[i]; i++) {
        datum = data[i];
        $item = $('<li class="mp_item" />');
        formatItem = options.formatItem.call($input, datum, $item);

        // Store the original data for easy access later.
        $item.data('marcoPolo', datum);

        $item
          .html(formatItem)
          .appendTo($list);

        if (compare) {
          // If the 'compare' setting is set to boolean 'true', assume the data
          // is a string and compare directly.
          if (options.compare === true) {
            compareCurrent = datum;
            compareSelected = selected;
          }
          // Otherwise, assume the data is an object and the 'compare' setting
          // is the attribute name to compare on.
          else {
            compareCurrent = datum[options.compare];
            compareSelected = selected[options.compare];
          }

          // Highlight this item if it matches the selected item.
          if (compareCurrent === compareSelected) {
            self._addHighlight($item);

            // Stop comparing the remaining results, as a match has been made.
            compare = false;
            compareMatch = true;
          }
        }
      }

      // Mark all selectable items, based on the 'selectable' selector setting.
      $list
        .children(options.selectable)
        .addClass('mp_selectable');

      self._trigger('results', [data]);

      self._showList();

      // Highlight the first item in the results list if the currently selected
      // item was not found and already highlighted.
      if (!compareMatch) {
        self._highlightFirst();
      }

      return self;
    },

    // Build the results list from a successful request.
    _buildSuccessList: function (q, data) {
      var self = this,
          $input = self.$input,
          $list = self.$list,
          options = self.options;

      $list.empty();

      // Fire 'formatData' callback.
      if (options.formatData) {
        data = options.formatData.call($input, data);
      }

      if ($.isEmptyObject(data)) {
        self._buildNoResultsList(q);
      }
      else {
        self._buildResultsList(q, data);
      }

      return self;
    },

    // Build the results list with an error message.
    _buildErrorList: function (jqXHR, textStatus, errorThrown) {
      var self = this,
          $input = self.$input,
          $list = self.$list,
          options = self.options,
          $item = $('<li class="mp_error" />'),
          formatError;

      $list.empty();

      // Fire 'formatError' callback.
      formatError = options.formatError && options.formatError.call($input, $item, jqXHR, textStatus, errorThrown);

      if (formatError) {
        $item.html(formatError);
      }

      self._trigger('error', [$item, jqXHR, textStatus, errorThrown]);

      // Displaying an error message is optional. It isn't displayed if the
      // 'formatError' callback returns a false value.
      if (formatError) {
        $item.appendTo($list);

        self._showList();
      }
      else {
        self._hideList();
      }

      return self;
    },

    // Build the results list with a message when the minimum number of
    // characters hasn't been entered.
    _buildMinCharsList: function (q) {
      var self = this,
          $input = self.$input,
          $list = self.$list,
          options = self.options,
          $item = $('<li class="mp_min_chars" />'),
          formatMinChars;

      // Don't display the minimum characters list when there are no
      // characters.
      if (!q.length) {
        self._hideAndEmptyList();

        return self;
      }

      $list.empty();

      // Fire 'formatMinChars' callback.
      formatMinChars = options.formatMinChars && options.formatMinChars.call($input, options.minChars, $item);

      if (formatMinChars) {
        $item.html(formatMinChars);
      }

      self._trigger('minChars', [options.minChars, $item]);

      // Displaying a minimum characters message is optional. It isn't
      // displayed if the 'formatMinChars' callback returns a false value.
      if (formatMinChars) {
        $item.appendTo($list);

        self._showList();
      }
      else {
        self._hideList();
      }

      return self;
    },

    // Cancel any pending ajax request and input key buffer.
    _cancelPendingRequest: function () {
      var self = this;

      // Abort the ajax request if still in progress.
      if (self.ajax) {
        self.ajaxAborted = true;
        self.ajax.abort();
      }
      else {
        self.ajaxAborted = false;
      }

      // Clear the request buffer.
      clearTimeout(self.timer);

      return self;
    },

    // Mark the input as changed due to a different value.
    _change: function (q) {
      var self = this;

      // Reset the currently selected item.
      self.selected = null;

      // Keep track of the new input value for later comparison.
      self.value = q;

      self._trigger('change', [q]);

      return self;
    },

    // Make a request for the specified query and build the results list.
    _request: function (q) {
      var self = this,
          $input = self.$input,
          $list = self.$list,
          options = self.options,
          cachedData;

      self._cancelPendingRequest();

      // Check if the input value has changed.
      if (q !== self.value) {
        self._change(q);
      }

      // Requests are buffered the number of ms specified by the 'delay'
      // setting. This helps prevent an ajax request for every keystroke.
      self.timer = setTimeout(function () {
        var param = {},
            params = {},
            cacheKey,
            $inputParent = $();

        // Display the minimum characters message if not reached.
        if (q.length < options.minChars) {
          self._buildMinCharsList(q);

          return self;
        }

        // Add the query to the additional data to be sent with the request.
        param[options.param] = q;

        params = $.extend({}, options.data, param);

        // Check for and use cached results if enabled.
        if (options.cache && (cachedData = options.cache.fetch(q, params, self)) ) {
          self._buildSuccessList(q, cachedData);
        }
        // Otherwise, make an ajax request for the data.
        else {
          self._trigger('requestBefore');

          // Add a class to the input's parent that can be hooked-into by the
          // CSS to show a busy indicator.
          $inputParent = $input.parent().addClass('mp_busy');

          // The ajax request is stored in case it needs to be aborted.
          self.ajax = $.ajax({
            url: options.url,
            dataType: 'json',
            data: params,
            success:
              function (data) {
                self._buildSuccessList(q, data);

                // Cache the data.
                if (options.cache) {
                  options.cache.add(q, params, data, self);
                }
              },
            error:
              function (jqXHR, textStatus, errorThrown) {
                // Show the error message unless the ajax request was aborted
                // by this plugin. 'ajaxAborted' is used because 'errorThrown'
                // does not faithfull return "aborted" as the cause.
                if (!self.ajaxAborted) {
                  self._buildErrorList(jqXHR, textStatus, errorThrown);
                }
              },
            complete:
              function (jqXHR, textStatus) {
                // Reset ajax reference now that it's complete.
                self.ajax = null;
                self.ajaxAborted = false;

                // Remove the "busy" indicator class on the input's parent.
                $inputParent.removeClass('mp_busy');

                self._trigger('requestAfter', [jqXHR, textStatus]);
              }
          });
        }
      }, options.delay);

      return self;
    },

    // Select an item from the results list.
    _select: function (data, $item) {
      var self = this,
          $input = self.$input,
          hideOnSelect = self.options.hideOnSelect;

      // Save the selection as the currently selected item.
      self.selected = data;

      // Do nothing more if the currently selected item is simply being reset.
      if (!data) {
        return self;
      }

      if (hideOnSelect) {
        self._hideList();
      }

      self._trigger('select', [data, $item]);

      // It's common to update the input value with the selected item during
      // 'onSelect', so check if that has occurred and store the new value.
      if ($input.val() !== self.value) {
        self.value = $input.val();

        // Hide and empty the existing results to prevent future stale results.
        self._hideAndEmptyList();
      }

      return self;
    },

    // Dismiss the results list and cancel any pending activity.
    _dismiss: function () {
      var self = this,
          $input = self.$input,
          $list = self.$list,
          options = self.options;

      self
        ._cancelPendingRequest()
        ._hideAndEmptyList();

      // Empty the input value if the 'required' setting is enabled and nothing
      // is selected.
      if (options.required && !self.selected) {
        $input.val('');
        self._change('');
      }

      self._toggleLabel();

      return self;
    },

    // Trigger a callback subscribed to via an option or using .bind().
    _trigger: function (name, args) {
      var self = this,
          callbackName = 'on' + name.charAt(0).toUpperCase() + name.slice(1),
          triggerName = self.widgetEventPrefix.toLowerCase() + name.toLowerCase(),
          callback = self.options[callbackName];

      self.element.trigger(triggerName, args);

      return callback && callback.apply(self.element, args);
    }
  });
})(jQuery);
