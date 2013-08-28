/*!
 * Marco Polo v1.8.0
 *
 * A jQuery autocomplete plugin for the discerning developer.
 *
 * https://github.com/jstayton/jquery-marcopolo
 *
 * Copyright 2013 by Justin Stayton
 * Licensed MIT
 */
(function (factory) {
  'use strict';

  // Register as an AMD module, compatible with script loaders like RequireJS.
  // Source: https://github.com/umdjs/umd/blob/master/jqueryPlugin.js
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  }
  else {
    factory(jQuery);
  }
}(function ($, undefined) {
  'use strict';

  // The cache spans all instances and is indexed by URL. This allows different
  // instances to pull the same cached results if their URLs match.
  var cache = {};

  // jQuery UI's Widget Factory provides an object-oriented plugin framework
  // that handles the common plumbing tasks.
  $.widget('mp.marcoPolo', {
    // Default options.
    options: {
      // Whether to cache query results.
      cache: true,
      // Whether to compare the selected item against items displayed in the
      // results list. The selected item is highlighted if a match is found,
      // instead of the first item in the list ('highlight' option must be
      // enabled). Set this option to 'true' if the data is a string;
      // otherwise, specify the data object attribute name to compare on.
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
      formatError: function () {
        return '<em>Your search could not be completed at this time.</em>';
      },
      // Format the display of each item in the results list.
      formatItem: function (data) {
        return data.title || data.name;
      },
      // Format the text that's displayed when the minimum number of characters
      // (specified with the 'minChars' option) hasn't been reached. Setting
      // this option to 'null' or returning 'false' suppresses the message from
      // being displayed.
      formatMinChars: function (minChars) {
        return '<em>Your search must be at least <strong>' + minChars + '</strong> characters.</em>';
      },
      // Format the text that's displayed when there are no results returned
      // for the requested input value. Setting this option to 'null' or
      // returning 'false' suppresses the message from being displayed.
      formatNoResults: function (q) {
        return '<em>No results for <strong>' + q + '</strong>.</em>';
      },
      // Whether to hide the results list when an item is selected. The results
      // list is still hidden when the input is blurred for any other reason.
      hideOnSelect: true,
      // Whether to automatically highlight an item when the results list is
      // displayed. Usually it's the first item, but it could be the previously
      // selected item if 'compare' is specified.
      highlight: true,
      // Positioning a label over an input is a common design pattern
      // (sometimes referred to as 'overlabel') that unfortunately doesn't
      // work so well with all of the input focus/blur events that occur with
      // autocomplete. With this option, however, the hiding/showing of the
      // label is handled internally to provide a built-in solution to the
      // problem.
      label: null,
      // The minimum number of characters required before a request is fired.
      minChars: 1,
      // Called when the user is finished interacting with the autocomplete
      // interface, not just the text input, which loses and gains focus on a
      // results list mouse click.
      onBlur: null,
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
      onSelect: function (data) {
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
      // Whether to allow the browser's default behavior of submitting the form
      // on ENTER.
      submitOnEnter: false,
      // The URL to GET request for the results.
      url: null
    },

    // Key code to key name mapping for easy reference.
    keys: {
      DOWN: 40,
      END: 35,
      ENTER: 13,
      ESC: 27,
      HOME: 36,
      TAB: 9,
      UP: 38
    },

    // Initialize the plugin on an input.
    _create: function () {
      var self = this,
          $input;

      // Create a more appropriately named alias for the input.
      self.$input = $input = self.element.addClass('mp_input');

      // The existing input name or a created one. Used for building the ID of
      // other elements.
      self.inputName = 'mp_' + ($input.attr('name') || $.now());

      // Create an empty list for displaying future results. Insert it directly
      // after the input element.
      self.$list = $('<ol class="mp_list" />')
                     .attr({
                       'aria-atomic': 'true',
                       'aria-busy': 'false',
                       'aria-live': 'polite',
                       'id': self.inputName + '_list',
                       'role': 'listbox'
                     })
                     .hide()
                     .insertAfter(self.$input);

      // Remember original input attribute values for when 'destroy' is called
      // and the input is returned to its original state.
      self.inputOriginals = {
        'aria-activedescendant': $input.attr('aria-activedescendant'),
        'aria-autocomplete': $input.attr('aria-autocomplete'),
        'aria-expanded': $input.attr('aria-expanded'),
        'aria-labelledby': $input.attr('aria-labelledby'),
        'aria-owns': $input.attr('aria-owns'),
        'aria-required': $input.attr('aria-required'),
        'autocomplete': $input.attr('autocomplete'),
        'role': $input.attr('role')
      };

      // Set plugin-specific attributes.
      $input.attr({
        'aria-autocomplete': 'list',
        'aria-owns': self.$list.attr('id'),
        'autocomplete': 'off',
        'role': 'combobox'
      });

      // The ajax request to get results is stored in case the request needs to
      // be aborted before a response is returned.
      self.ajax = null;
      self.ajaxAborted = false;

      // A reference to this function is maintained for unbinding in the
      // 'destroy' method. This is necessary because the selector is so
      // generic (document).
      self.documentMouseup = null;

      // "Pseudo" focus includes any interaction with the plugin, even if the
      // input has blurred.
      self.focusPseudo = false;

      // "Real" focus is strictly when the input has focus.
      self.focusReal = false;

      // Whether a mousedown event is triggered on a list item.
      self.mousedown = false;

      // The currently selected data.
      self.selectedData = null;

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

      self
        ._initSelected()
        ._initOptions();
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
          allOptions = option === undefined,
          options = {};

      // If no option is specified, initialize all options.
      if (allOptions) {
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

            // Ensure that the label has an ID for ARIA support.
            if (self.options.label.attr('id')) {
              self.removeLabelId = false;
            }
            else {
              self.removeLabelId = true;

              self.options.label.attr('id', self.inputName + '_label');
            }

            self._toggleLabel();

            self.$input.attr('aria-labelledby', self.options.label.attr('id'));

            break;

          case 'required':
            self.$input.attr('aria-required', value);

            break;

          case 'selected':
            // During initial creation (when all options are initialized), only
            // initialize the 'selected' value if there is one. The
            // '_initSelected' method parses the input's attributes for a
            // selected value.
            if (allOptions && value) {
              self.select(value, null, true);
            }

            break;

          case 'url':
            // If no 'url' option is specified, use the parent form's 'action'.
            if (!value) {
              self.options.url = self.$input.closest('form').attr('action');
            }

            break;
        }
      });

      return self;
    },

    // Programmatically change the input value without triggering a search
    // request (use the 'search' method for that). If the value is different
    // than the current input value, the 'onChange' callback is fired.
    change: function (q, onlyValue) {
      var self = this;

      // Change the input value if a new value is specified.
      if (q === self.value) {
        return;
      }

      if (q !== self.$input.val()) {
        self.$input.val(q);
      }

      // Reset the currently selected data.
      self.selectedData = null;

      // Keep track of the new input value for later comparison.
      self.value = q;

      self._trigger('change', [q]);

      if (onlyValue !== true) {
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
      if (q !== undefined) {
        $input.val(q);
      }

      // Focus on the input to start the request and enable keyboard
      // navigation (only available when the input has focus).
      $input.focus();
    },

    // Select an item from the results list.
    select: function (data, $item, initial) {
      var self = this,
          $input = self.$input,
          hideOnSelect = self.options.hideOnSelect;

      if (hideOnSelect) {
        self._hideList();
      }

      // If there's no data, consider this a call to deselect (or reset) the
      // current value.
      if (!data) {
        return self.change('');
      }

      // Save the selected data for later reference.
      self.selectedData = data;

      self._trigger('select', [data, $item, !!initial]);

      // It's common to update the input value with the selected item during
      // 'onSelect', so check if that has occurred and store the new value.
      if ($input.val() !== self.value) {
        self.value = $input.val();

        // Check if the label needs to be toggled when this method is called
        // programmatically (usually meaning the input doesn't have focus).
        if (!self.focusPseudo) {
          self._toggleLabel();
        }

        // Hide and empty the existing results to prevent future stale results.
        self._hideAndEmptyList();
      }
    },

    // Initialize the input with a selected value from the 'data-selected'
    // attribute (JSON) or standard 'value' attribute (string).
    _initSelected: function () {
      var self = this,
          $input = self.$input,
          data = $input.data('selected'),
          value = $input.val();

      if (data) {
        self.select(data, null, true);
      }
      else if (value) {
        self.select(value, null, true);
      }

      return self;
    },

    // Get the currently selected data.
    selected: function () {
      return this.selectedData;
    },

    // Remove the autocomplete functionality and return the selected input
    // fields to their original state.
    destroy: function () {
      var self = this,
          options = self.options,
          $input = self.$input;

      // Remove the results list element.
      self.$list.remove();

      // Reset the input to its original attribute values.
      $.each(self.inputOriginals, function (attribute, value) {
        if (value === undefined) {
          $input.removeAttr(attribute);
        }
        else {
          $input.attr(attribute, value);
        }
      });

      $input.removeClass('mp_input');

      // Reset the label to its original state.
      if (options.label) {
        options.label.removeClass('mp_label');

        if (self.removeLabelId) {
          options.label.removeAttr('id');
        }
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

            // Highlight the first item.
            case self.keys.HOME:
              // The default scrolls the page to the top.
              key.preventDefault();

              // Show the list if it has been hidden by ESC.
              self
                ._showList()
                ._highlightFirst();

              break;

            // Highlight the last item.
            case self.keys.END:
              // The default scrolls the page to the bottom.
              key.preventDefault();

              // Show the list if it has been hidden by ESC.
              self
                ._showList()
                ._highlightLast();

              break;

            // Select the currently highlighted item. Input keeps focus.
            case self.keys.ENTER:
              // Prevent selection if the list isn't visible.
              if (!$list.is(':visible')) {
                // Prevent the form from submitting.
                if (!self.options.submitOnEnter) {
                  key.preventDefault();
                }

                return;
              }

              $highlighted = self._highlighted();

              if ($highlighted.length) {
                self.select($highlighted.data('marcoPolo'), $highlighted);
              }

              // Prevent the form from submitting if 'submitOnEnter' is
              // disabled or if there's a highlighted item.
              if (!self.options.submitOnEnter || $highlighted.length) {
                key.preventDefault();
              }

              break;

            // Select the currently highlighted item. Input loses focus.
            case self.keys.TAB:
              // Prevent selection if the list isn't visible.
              if (!$list.is(':visible')) {
                return;
              }

              $highlighted = self._highlighted();

              if ($highlighted.length) {
                self.select($highlighted.data('marcoPolo'), $highlighted);
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
        .bind('keyup.marcoPolo', function () {
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

          self.select($item.data('marcoPolo'), $item);

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

      if ($label && $label.length) {
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
      $item
        .removeClass('mp_highlighted')
        .attr('aria-selected', 'false')
        .removeAttr('id');

      this.$input.removeAttr('aria-activedescendant');

      return this;
    },

    // Add the highlight class to the specified item.
    _addHighlight: function ($item) {
      // The current highlight is removed to ensure that only one item is
      // highlighted at a time.
      this._removeHighlight(this._highlighted());

      $item
        .addClass('mp_highlighted')
        .attr({
          'aria-selected': 'true',
          'id': this.inputName + '_highlighted'
        });

      this.$input.attr('aria-activedescendant', $item.attr('id'));

      return this;
    },

    // Highlight the first selectable item in the results list.
    _highlightFirst: function () {
      this._addHighlight(this._firstSelectableItem());

      return this;
    },

    // Highlight the last selectable item in the results list.
    _highlightLast: function () {
      this._addHighlight(this._lastSelectableItem());

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
      // But only if there are results to be shown.
      if (this.$list.children().length) {
        this.$list.show();

        this.$input.attr('aria-expanded', 'true');
      }

      return this;
    },

    // Hide the results list.
    _hideList: function () {
      this.$list.hide();

      this.$input
        .removeAttr('aria-activedescendant')
        .removeAttr('aria-expanded');

      return this;
    },

    // Empty the results list.
    _emptyList: function () {
      this.$list.empty();

      this.$input.removeAttr('aria-activedescendant');

      return this;
    },

    // Hide and empty the results list.
    _hideAndEmptyList: function () {
      this.$list
        .hide()
        .empty();

      this.$input
        .removeAttr('aria-activedescendant')
        .removeAttr('aria-expanded');

      return this;
    },

    // Build the results list from a successful request that returned no data.
    _buildNoResultsList: function (q) {
      var self = this,
          $input = self.$input,
          $list = self.$list,
          options = self.options,
          $item = $('<li class="mp_no_results" role="alert" />'),
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
          // The currently selected data for use in comparison.
          selected = self.selectedData,
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
      for (var i = 0, length = data.length; i < length; i++) {
        datum = data[i];
        $item = $('<li class="mp_item" />');
        formatItem = options.formatItem.call($input, datum, $item);

        // Store the original data for easy access later.
        $item.data('marcoPolo', datum);

        $item
          .html(formatItem)
          .appendTo($list);

        if (compare && options.highlight) {
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
        .addClass('mp_selectable')
        .attr({
          'aria-selected': 'false',
          'role': 'option'
        });

      self._trigger('results', [data]);

      self._showList();

      // Highlight the first item in the results list if the currently selected
      // item was not found and already highlighted, and the option to auto-
      // highlight is enabled.
      if (!compareMatch && options.highlight) {
        self._highlightFirst();
      }

      return self;
    },

    // Build the results list from a successful request.
    _buildSuccessList: function (q, data) {
      var self = this,
          $input = self.$input,
          options = self.options;

      self._emptyList();

      // Fire 'formatData' callback.
      if (options.formatData) {
        data = options.formatData.call($input, data);
      }

      if (!data || data.length === 0 || $.isEmptyObject(data)) {
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
          $item = $('<li class="mp_error" role="alert" />'),
          formatError;

      self._emptyList();

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
          $item = $('<li class="mp_min_chars" role="alert" />'),
          formatMinChars;

      // Don't display the minimum characters list when there are no
      // characters.
      if (!q.length) {
        self._hideAndEmptyList();

        return self;
      }

      self._emptyList();

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

    // Make a request for the specified query and build the results list.
    _request: function (q) {
      var self = this,
          $input = self.$input,
          $list = self.$list,
          options = self.options;

      self._cancelPendingRequest();

      // Check if the input value has changed.
      self.change(q, true);

      // Requests are buffered the number of ms specified by the 'delay'
      // setting. This helps prevent an ajax request for every keystroke.
      self.timer = setTimeout(function () {
        var data = {},
            param = {},
            params = {},
            cacheKey,
            $inputParent = $();

        // Display the minimum characters message if not reached.
        if (q.length < options.minChars) {
          self._buildMinCharsList(q);

          return self;
        }

        // Get the additional data to send with the request.
        data = $.isFunction(options.data) ? options.data.call(self.$input, q) : options.data;

        // Add the query to be sent with the request.
        param[options.param] = q;

        // Merge all parameters together.
        params = $.extend({}, data, param);

        // Build the request URL with query string data to use as the cache
        // key.
        cacheKey = options.url + (options.url.indexOf('?') === -1 ? '?' : '&') + $.param(params);

        // Check for and use cached results if enabled.
        if (options.cache && cache[cacheKey]) {
          self._buildSuccessList(q, cache[cacheKey]);
        }
        // Otherwise, make an ajax request for the data.
        else {
          self._trigger('requestBefore');

          // Add a class to the input's parent that can be hooked-into by the
          // CSS to show a busy indicator.
          $inputParent = $input.parent().addClass('mp_busy');
          $list.attr('aria-busy', 'true');

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
                  cache[cacheKey] = data;
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
                $list.attr('aria-busy', 'false');

                self._trigger('requestAfter', [jqXHR, textStatus]);
              }
          });
        }
      }, options.delay);

      return self;
    },

    // Dismiss the results list and cancel any pending activity.
    _dismiss: function () {
      var self = this,
          options = self.options;

      self.focusPseudo = false;

      self
        ._cancelPendingRequest()
        ._hideAndEmptyList();

      // Empty the input value if the 'required' setting is enabled and nothing
      // is selected.
      if (options.required && !self.selectedData) {
        self.change('', true);
      }

      self
        ._toggleLabel()
        ._trigger('blur');

      return self;
    },

    // Trigger a callback subscribed to via an option or using .bind().
    _trigger: function (name, args) {
      var self = this,
          callbackName = 'on' + name.charAt(0).toUpperCase() + name.slice(1),
          triggerName = self.widgetEventPrefix.toLowerCase() + name.toLowerCase(),
          triggerArgs = $.isArray(args) ? args : [],
          callback = self.options[callbackName];

      self.element.trigger(triggerName, triggerArgs);

      return callback && callback.apply(self.element, triggerArgs);
    }
  });
}));
