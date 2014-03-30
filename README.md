Marco Polo
==========

[![Selenium Test Status](https://saucelabs.com/buildstatus/marcopolo)](https://saucelabs.com/u/marcopolo)
[![Build Status](https://secure.travis-ci.org/jstayton/jquery-marcopolo.png?branch=master)](https://travis-ci.org/jstayton/jquery-marcopolo)

A jQuery autocomplete plugin for the discerning developer.

After spending years struggling with various autocomplete plugins, I became fed
up with their bugginess, poor documentation, lack of updates, inflexibility,
and antiquated coding patterns. Surely something as fundamental as autocomplete
could — really, _should_ — be done better. And now it has. Meet Marco Polo. For
the discerning developer.

Developed by [Justin Stayton](http://twitter.com/jstayton) while at
[Monk Development](http://monkdev.com) for the
[Ekklesia 360](http://ekklesia360.com) CMS.

*   [Examples](http://jstayton.github.io/jquery-marcopolo)
*   [Release Notes](https://github.com/jstayton/jquery-marcopolo/wiki/Release-Notes)

Features
--------

*   **Cache and buffer.** Marco Polo prevents unnecessary requests through its
    build-in results cache (shared by all instances) and key press buffer (only
    makes a request after the user has finished typing).
*   **Remembers selection.** Once a result is selected, if that same result
    appears in the results again, it's automatically highlighted. This is very
    similar to how _select_ inputs mark the currently selected item.
*   **Require selection.** Marco Polo can be configured to require a selection
    be made from the results, ensuring that the text input is left empty when
    no selection is made.
*   **Overlabel support.** _Overlabel_ is the concept of placing a _label_
    element over a text input for a more compact display. Marco Polo offers
    built-in support for hiding and showing the label automatically, depending
    on the state of interaction with the plugin.
*   **Complete styling control.** With straightforward markup that's explained
    in detail, you can easily style and modify all of the components to fit
    your needs and aesthetic.
*   **Callbacks for all major events.** Add your own twist when a search is
    made, result is selected, error occurs, and more.
*   **Maintained.**  I developed this plugin for production use in the
    [Ekklesia 360](http://ekklesia360.com) CMS at
    [Monk Development](http://monkdev.com), so you can very much believe that
    it will remain bug-free and up-to-date. Any feature requests, bug reports,
    or feedback you submit will be responded to quickly as well.
*   **Documented.** I believe that code is only as useful as its documentation.
    This manifests itself not only in clear and thorough developer
    documentation (below), but also verbose documentation within the code
    itself.
*   **WAI-ARIA support.** Assistive technology users can fully understand and
    navigate Marco Polo.

Requirements
------------

*   jQuery >= 1.4.3
*   jQuery UI Widget >= 1.8.21 (included in minified build)
*   All modern browsers, including IE >= 6

Installation
------------

### Download

#### Bower

[Bower](http://bower.io) is a package manager for the web. Once installed, Bower
can install Marco Polo with a single command:

    bower install jquery-marcopolo

#### Manually

*   [Minified without comments](https://raw.github.com/jstayton/jquery-marcopolo/master/build/jquery.marcopolo.min.js)
*   [Full source with comments](https://raw.github.com/jstayton/jquery-marcopolo/master/build/jquery.marcopolo.js)

### Include

Include both jQuery and Marco Polo in your HTML:

```html
<script src="jquery.min.js"></script>
<script src="jquery.marcopolo.min.js"></script>
```

In most cases, `jquery.marcopolo.min.js` is the best file to include, as it
contains the required libraries and source code in a single minified package.

The `build` directory contains a number of other files as well:

*   `jquery.marcopolo.js` contains the required libraries and source code in a
    single unmifified package.
*   `build/parts` contains each individual library and source file in both
    minified and unminified varieties.

Getting Started
---------------

Let's say you want to create a user search field that redirects to the user's
profile when a result is selected. To start, add a text input, if you haven't
already:

```html
<input type="text" name="userSearch" id="userSearch">
```

Then attach Marco Polo to the text input in your JavaScript:

```javascript
$('#userSearch').marcoPolo({
  url: '/users/search',
  formatItem: function (data, $item) {
    return data.first_name + ' ' + data.last_name;
  },
  onSelect: function (data, $item) {
    window.location = data.profile_url;
  }
});
```

When a search happens, a GET request is made to the `url` with `q`
(the search value) added to the query string. (Additional data can be included
using the `data` option.) Let's say a search is made for _Butler_. A GET
request is made to `/users/search?q=Butler`. Your backend code must then use
the `q` parameter to find and return the matching users in JSON format:

```json
[
  {
    "first_name": "James',
    "last_name": "Butler',
    "profile_url": "/users/78749',
    …
  },
  {
    "first_name": "Win",
    "last_name": "Butler",
    "profile_url": "/users/41480",
    …
  },
  …
]
```

Each JSON user object is passed to the `formatItem` callback option for display
in the results list. And when a user is selected from the results list, their
JSON object is then passed to the `onSelect` callback option to complete the
browser redirect.

You should now have enough understanding of Marco Polo to start configuring it
for your specific needs. While this example demonstrates a number of
fundamental concepts, the possibilities extend far beyond the straightforward
_search, click, redirect_ setup shown here. And when you're ready, consider
reading through some of the more advanced guides:

*   [CSS Starter Template](https://github.com/jstayton/jquery-marcopolo/wiki/CSS-Starter-Template)
*   [HTML Breakdown](https://github.com/jstayton/jquery-marcopolo/wiki/HTML-Breakdown)
*   [Setting an Initial Value](https://github.com/jstayton/jquery-marcopolo/wiki/Setting-an-Initial-Value)
*   [Showing a Busy Indicator](https://github.com/jstayton/jquery-marcopolo/wiki/Showing-a-Busy-Indicator)

Options
-------

All options are optional, although _url_ is usually specified unless the input
field is in a form by itself (in which case the form's _action_ attribute can
be used).

*   **cache** _boolean_

    Whether to cache query results. The cache is shared by all instances, which
    is a big advantage when many of the same field type appear on the same
    page. For example, a tags field that's repeated for every record on a page.

    _Default:_ true

    ----------------------------------------------------------------------------
*   **compare** _boolean, string_

    Whether to compare the selected item against items displayed in the results
    list. The selected item is highlighted if a match is found, instead of the
    first item in the list (_highlight_ option must be enabled). Set this
    option to _true_ if the data is a string; otherwise, specify the data
    object attribute name to compare on.

    _Default:_ false

    ----------------------------------------------------------------------------
*   **data** _object, string, function_

    Additional data to be sent in the request query string. (Note: The query
    string parameter that is set with the input value (_param_ option) will
    overwrite the value in the data object if an attribute with the same name
    exists.)

    _Default:_ {}

    When a function is used, it's called for every request, allowing the data to
    be dynamic. An _object_ must be returned.

    _Parameters:_

    *   **q** _string_ Requested input value.

    _this:_ _jQuery object_ Text input (no need to wrap like _$(this)_).

    _Return:_ _object_ of additional data.

    ----------------------------------------------------------------------------
*   **delay** _integer_

    The number of milliseconds to delay before firing a request after a change
    is made to the input value. This helps prevent an ajax request on every
    keystroke from overwhelming the server and slowing down the page.

    _Default:_ 250

    ----------------------------------------------------------------------------
*   **hideOnSelect** _boolean_

    Whether to hide the results list when an item is selected. Interesting
    things can be done when this is set to _false_, such as hiding and showing
    certain items when other items are selected. The results list is still
    hidden when the input is blurred for any other reason.

    _Default:_ true

    ----------------------------------------------------------------------------
*   **highlight** _boolean_

    Whether to automatically highlight an item when the results list is
    displayed. Usually it's the first item, but it could be the previously
    selected item if _compare_ is specified.

    _Default:_ true

    ----------------------------------------------------------------------------
*   **label** _selector, jQuery object, DOM element, null_

    Positioning a label over an input is a common design pattern (sometimes
    referred to as _overlabel_) that unfortunately doesn't work so well with
    all of the input focus/blur events that occur with autocomplete. With this
    option, however, the hiding/showing of the label is handled internally to
    provide a built-in solution to the problem. The label receives the class
    _mp\_label_.

    _Default:_ null

    ----------------------------------------------------------------------------
*   **minChars** _integer_

    The minimum number of characters required before a request is fired. See
    the _formatMinChars_ callback to format the (optional) message displayed
    when this value is not reached.

    _Default:_ 1

    ----------------------------------------------------------------------------
*   **param** _string_

    The name of the query string parameter that is set with the input value.

    _Default:_ q

    ----------------------------------------------------------------------------
*   **required** _boolean_

    Whether to clear the input value when no selection is made from the results
    list. This happens when the input is blurred, usually by clicking or
    tabbing out of the field.

    _Default:_ false

    ----------------------------------------------------------------------------
*   **selectable** _selector_

    The list items to make selectable. For example, say you add the class
    _header_ to a number of list items (in the _formatItem_ callback) that you
    want to act as non-selectable headers. They can be excluded with the
    selector _:not(.header)_. Selectable items receive the class
    _mp\_selectable_.

    _Default:_ *

    ----------------------------------------------------------------------------
*   **selected** _object, null_

    Prime the input with a selected item. _onSelect_ is called just as if the
    item were selected from the results list.

    _Default:_ null

    ----------------------------------------------------------------------------
*   **submitOnEnter** _boolean_

    Whether to allow the browser's default behavior of submitting the form on
    ENTER.

    _Default:_ false

    ----------------------------------------------------------------------------
*   **url** _string, null_

    The URL to GET request for the results, which must be an array of strings
    or JSON. If no URL is set, the parent form's _action_ attribute value is
    used if one exists. _q_ is added to the query string with the input value,
    along with any additional _data_.

    _Default:_ null

### Callbacks

#### Formatting

*   **formatData** (data) _function, null_

    Format the raw data that's returned from the ajax request. Useful for
    further filtering the data or returning the array of results that's
    embedded deeper in the object.

    _Default:_ null

    _Parameters:_

    *   **data** _array, object_ Data returned from the request.

    _this:_ _jQuery object_ Text input (no need to wrap like _$(this)_).

    _Return:_ _array_ of _objects_ to use as the data.

    ----------------------------------------------------------------------------
*   **formatError** ($item, jqXHR, textStatus, errorThrown)
    _function, null_

    Format the text that's displayed when the ajax request fails. The message
    is displayed in a list item with the class _mp\_error_:

    ```html
    <li class="mp_error">
      <em>Your search could not be completed at this time.</em>
    </li>
    ```

    Setting this option to _null_ or returning _false_ suppresses the message
    from being displayed.

    _Default:_

    ```javascript
    return '<em>Your search could not be completed at this time.</em>';
    ```

    _Parameters:_

    *   **$item** _jQuery object_ List item to display the message.
    *   **jqXHR** _object_ or _XMLHTTPRequest_ in jQuery 1.4.x.
    *   **textStatus** _string_ Error status of the request.
    *   **errorThrown** _string_ HTTP error status.

    _this:_ _jQuery object_ Text input (no need to wrap like _$(this)_).

    _Return:_ _string_, _DOM element_, or _jQuery object_ to use as the
              message.

    ----------------------------------------------------------------------------
*   **formatItem** (data, $item) _function_

    Format the display of each item in the results list. By default, the
    _title_ or _name_ value of the data object is displayed. The returned value
    is added to a list item with the class _mp\_item_:

    ```html
    <li class="mp_item">The Title of Something</li>
    ```

    _Default:_

    ```javascript
    return data.title || data.name;
    ```

    _Parameters:_

    *   **data** _string, object_ Data returned from the request.
    *   **$item** _jQuery object_ List item to display the result.

    _this:_ _jQuery object_ Text input (no need to wrap like _$(this)_).

    _Return:_ _string_, _DOM element_, or _jQuery object_ to use as the
              display.

    ----------------------------------------------------------------------------
*   **formatMinChars** (minChars, $item) _function, null_

    Format the text that's displayed when the minimum number of characters
    (specified with the _minChars_ option) hasn't been reached. The message is
    displayed in a list item with the class _mp\_min\_chars_:

    ```html
    <li class="mp_min_chars">
      <em>Your search must be at least <strong>3</strong> characters.</em>
    </li>
    ```

    Setting this option to _null_ or returning _false_ suppresses the message
    from being displayed. It is also not displayed when there is no input
    value.

    _Default:_

    ```javascript
    return '<em>Your search must be at least <strong>' + minChars + '</strong>characters.</em>';
    ```

    _Parameters:_

    *   **minChars** _integer_ Minimum number of characters required.
    *   **$item** _jQuery object_ List item to display the message.

    _this:_ _jQuery object_ Text input (no need to wrap like _$(this)_).

    _Return:_ _string_, _DOM element_, or _jQuery object_ to use as the
              message.

    ----------------------------------------------------------------------------
*   **formatNoResults** (q, $item) _function, null_

    Format the text that's displayed when there are no results returned for the
    requested input value. The message is displayed in a list item with the
    class _mp\_no\_results_:

    ```html
    <li class="mp_no_results">
      <em>No results for <strong>something</strong>.</em>
    </li>
    ```

    Setting this option to _null_ or returning _false_ suppresses the message
    from being displayed.

    _Default:_

    ```javascript
    return '<em>No results for <strong>' + q + '</strong>.</em>';
    ```

    _Parameters:_

    *   **q** _string_ Requested input value.
    *   **$item** _jQuery object_ List item to display the message.

    _this:_ _jQuery object_ Text input (no need to wrap like _$(this)_).

    _Return:_ _string_, _DOM element_, or _jQuery object_ to use as the
              message.

#### Events

*   **onBlur** () _function, null_

    Called when the user is finished interacting with the autocomplete
    interface, not just the text input, which loses and gains focus on a
    results list mouse click.

    _Default:_ null

    _Parameters:_ none

    _this:_ _jQuery object_ Text input (no need to wrap like _$(this)_).

    _Event:_ You can also bind to the _marcopoloblur_ event:

    ```javascript
    $(selector).on('marcopoloblur', function (event) { … });
    ```

    ----------------------------------------------------------------------------
*   **onChange** (q) _function, null_

    Called when the input value changes.

    _Default:_ null

    _Parameters:_

    *   **q** _string_ Changed input value.

    _this:_ _jQuery object_ Text input (no need to wrap like _$(this)_).

    _Event:_ You can also bind to the _marcopolochange_ event:

    ```javascript
    $(selector).on('marcopolochange', function (event, q) { … });
    ```

    ----------------------------------------------------------------------------
*   **onError** ($item, jqXHR, textStatus, errorThrown)
    _function, null_

    Called when the ajax request fails.

    _Default:_ null

    _Parameters:_

    *   **$item** _jQuery object_ List item to display the message.
    *   **jqXHR** _object_ or _XMLHTTPRequest_ in jQuery 1.4.x.
    *   **textStatus** _string_ Error status of the request.
    *   **errorThrown** _string_ HTTP error status.

    _this:_ _jQuery object_ Text input (no need to wrap like _$(this)_).

    _Event:_ You can also bind to the _marcopoloerror_ event:

    ```javascript
    $(selector).on('marcopoloerror', function (event, $item, jqXHR, textStatus, errorThrown) { … });
    ```

    ----------------------------------------------------------------------------
*   **onFocus** () _function, null_

    Called when the text input receives focus. This is different than the
    standard _focus_ event on the text input, however, as this callback does
    not fire when a results list item is selected via mouse click, which causes
    the text input to _blur_ and immediately gain _focus_ again.

    _Default:_ null

    _Parameters:_ none

    _this:_ _jQuery object_ Text input (no need to wrap like _$(this)_).

    _Event:_ You can also bind to the _marcopolofocus_ event:

    ```javascript
    $(selector).on('marcopolofocus', function (event) { … });
    ```

    ----------------------------------------------------------------------------
*   **onMinChars** (minChars, $item) _function, null_

    Called when the minimum number of characters (specified with the _minChars_
    option) hasn't been reached by the end of the _delay_.

    _Default:_ null

    _Parameters:_

    *   **minChars** _integer_ Minimum number of characters required.
    *   **$item** _jQuery object_ List item to display the message.

    _this:_ _jQuery object_ Text input (no need to wrap like _$(this)_).

    _Event:_ You can also bind to the _marcopolominchars_ event:

    ```javascript
    $(selector).on('marcopolominchars', function (event, minChars, $item) { … });
    ```

    ----------------------------------------------------------------------------
*   **onNoResults** (q, $item) _function, null_

    Called when there are no results returned for the request.

    _Default:_ null

    _Parameters:_

    *   **q** _string_ Requested input value.
    *   **$item** _jQuery object_ List item to display the message.

    _this:_ _jQuery object_ Text input (no need to wrap like _$(this)_).

    _Event:_ You can also bind to the _marcopolonoresults_ event:

    ```javascript
    $(selector).on('marcopolonoresults', function (event, q, $item) { … });
    ```

    ----------------------------------------------------------------------------
*   **onRequestBefore** () _function, null_

    Called before the ajax request is made. Useful for showing a loading
    spinner if the request is going to take some time.

    _Default:_ null

    _Parameters:_ none

    _this:_ _jQuery object_ Text input (no need to wrap like _$(this)_).

    _Event:_ You can also bind to the _marcopolorequestbefore_ event:

    ```javascript
    $(selector).on('marcopolorequestbefore', function (event) { … });
    ```

    ----------------------------------------------------------------------------
*   **onRequestAfter** (jqXHR, textStatus) _function, null_

    Called after the ajax request completes (success or error). Useful for
    hiding a loading spinner that's shown in _onRequestBefore_.

    _Default:_ null

    _Parameters:_

    *   **jqXHR** _object_ or _XMLHTTPRequest_ in jQuery 1.4.x.
    *   **textStatus** _string_ Status of the request.

    _this:_ _jQuery object_ Text input (no need to wrap like _$(this)_).

    _Event:_ You can also bind to the _marcopolorequestafter_ event:

    ```javascript
    $(selector).on('marcopolorequestafter', function (event, jqXHR, textStatus) { … });
    ```

    ----------------------------------------------------------------------------
*   **onResults** (data) _function, null_

    Called when there are results to be displayed.

    _Default:_ null

    _Parameters:_

    *   **data** _array_ Data returned from the request.

    _this:_ _jQuery object_ Text input (no need to wrap like _$(this)_).

    _Event:_ You can also bind to the _marcopoloresults_ event:

    ```javascript
    $(selector).on('marcopoloresults', function (event, data) { … });
    ```

    ----------------------------------------------------------------------------
*   **onSelect** (data, $item, initial) _function, null_

    Called when an item is selected from the results list or an initial value
    (see [Setting an Initial Value](https://github.com/jstayton/jquery-marcopolo/wiki/Setting-an-Initial-Value)).
    By default, the _title_ or _name_ value of the data object is used to
    populate the input value.

    _Default:_

    ```javascript
    this.val(data.title || data.name);
    ```

    _Parameters:_

    *   **data** _string, object_ Data returned from the request.
    *   **$item** _jQuery object, null_ Selected results list item. _null_ if
                                        _selected_ option used.
    *   **initial** _boolean_ Whether this is an initial value.

    _this:_ _jQuery object_ Text input (no need to wrap like _$(this)_).

    _Event:_ You can also bind to the _marcopoloselect_ event:

    ```javascript
    $(selector).on('marcopoloselect', function (event, data, $item, initial) { … });
    ```

Methods
-------

*   **change**

    Programmatically change the input value without triggering a search request
    (use the _search_ method for that). If the value is different than the
    current input value, the _onChange_ callback is fired.

    _Example:_

    ```javascript
    $('#userSearch').marcoPolo('change', 'Wilson');
    ```

    _Parameters:_

    *   **q** _string_ New input value.

    ----------------------------------------------------------------------------
*   **destroy**

    Remove the autocomplete functionality and return the selected input
    fields to their original state.

    _Example:_

    ```javascript
    $('#userSearch').marcoPolo('destroy');
    ```

    ----------------------------------------------------------------------------
*   **list**

    Get the results list element.

    _Example:_

    ```javascript
    $('#userSearch').marcoPolo('list');
    ```

    ----------------------------------------------------------------------------
*   **option**

    Get or set one or more options.

    _Example:_

    Get a specific option:

    ```javascript
    $('#userSearch').marcoPolo('option', 'url');
    ```

    Get the entire options object:

    ```javascript
    $('#userSearch').marcoPolo('option');
    ```

    Set a specific option:

    ```javascript
    $('#userSearch').marcoPolo('option', 'url', '/new/url');
    ```

    Set multiple options:

    ```javascript
    $('#userSearch').marcoPolo('option', {
      url: '/new/url',
      onSelect: function (data, $item) { … }
    });
    ```

    _Parameters:_

    *   **nameOrValues** _string, object_ Optional options to get or set.
    *   **value** _mixed_ Optional option value to set.

    ----------------------------------------------------------------------------
*   **search**

    Programmatically trigger a search request using the existing input value
    or a new one. The input receives focus to allow for keyboard navigation.

    _Example:_

    Trigger a search on the existing input value:

    ```javascript
    $('#userSearch').marcoPolo('search');
    ```

    Trigger a search on a new value:

    ```javascript
    $('#userSearch').marcoPolo('search', 'Wilson');
    ```

    _Parameters:_

    *   **q** _string_ Optional new input value to search on.

    ----------------------------------------------------------------------------
*   **select**

    Set the currently selected data, just as if the user clicked or keyboard
    selected an item from the results list. The _onSelect_ callback is fired.

    _Example:_

    ```javascript
    $('#userSearch').marcoPolo('select', { first_name: 'Lindsay', … });
    ```

    _Parameters:_

    *   **data** _string, object_ Data of the selected item.

    ----------------------------------------------------------------------------
*   **selected**

    Get the currently selected data (_string_, _object_, or _null_ if not set).

    _Example:_

    ```javascript
    $('#userSearch').marcoPolo('selected');
    ```

Feedback
--------

Please open an issue to request a feature or submit a bug report. Or even if
you just want to provide some feedback, I'd love to hear. I'm also available on
Twitter as [@jstayton](http://twitter.com/jstayton).

Contributing
------------

1.  Fork it.
2.  Create your feature branch (`git checkout -b my-new-feature`).
3.  Commit your changes (`git commit -am 'Added some feature'`).
4.  Push to the branch (`git push origin my-new-feature`).
5.  Create a new Pull Request.
