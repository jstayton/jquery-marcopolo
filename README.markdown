Marco Polo
==========

A modern jQuery plugin for autocomplete functionality on a text input,
extracted from the [Ekklesia 360](http://ekklesia360.com) CMS by
[Monk Development](http://monkdev.com).

*   [Example](http://jstayton.github.com/jquery-marcopolo)
*   [Release Notes](https://github.com/jstayton/jquery-marcopolo/wiki/Release-Notes)

Huh? Why?
---------

After spending years struggling with various autocomplete plugins, I became fed
up with their bugginess, poor documentation, lack of updates, inflexibility,
and antiquated coding patterns. Surely something as fundamental as autocomplete
could — really, _should_ — be done better.

So, I set out to create an autocomplete plugin that followed a number of
important principals:

*   **Modern**

    jQuery has come a long way in the past few years, and not just in terms of
    speed. Patterns and best practices for plugin development have become much
    more formulated. Unfortunately, most autocomplete plugins are stuck in the
    past, and fail to provide the superior user and developer experience that
    modern plugins (such as this) foster.

*   **Thoughtful**

    Maybe it's just me, but I judge any new autocomplete plugin by its user
    experience. If I find the results list showing when it shouldn't — or
    worse, stuck open and not closing — I know there are likely other details
    that weren't paid the necessary attention. Not that this plugin is perfect,
    but a lot of thought and care was and is put into what's important.

*   **Lean & Flexible**

    There's a fine line between too little and too much. This plugin certainly
    isn't for _every_ situation, but it strives to provide enough options and
    callbacks to allow for _many_ situations. By not baking in specific use
    cases, the plugin can stay lean (about 7.4 KB compressed) and flexible.

*   **Maintained**

    I developed this plugin for production use in the
    [Ekklesia 360](http://ekklesia360.com) CMS at
    [Monk Development](http://monkdev.com), so you can very much believe that
    it will remain bug-free and up-to-date. Any feature requests, bug reports,
    or feedback you submit will be responded to quickly as well.

*   **Documented**

    I believe that code is only as useful as its documentation. This manifests
    itself not only in clear and thorough developer documentation (below), but
    also verbose documentation within the code itself.

Requirements
------------

jQuery 1.4.2 or newer. All modern browsers are supported, as well as IE 6 and newer.

How it Works
------------

Let's say you want to create a user search field that redirects to the user's
profile when a result is selected. To start, make sure both jQuery and Marco
Polo are included on the page:

    <script type="text/javascript" src="jquery.min.js"></script>
    <script type="text/javascript" src="jquery.marcopolo.min.js"></script>

Next, add a text input field:

    <input type="text" id="userSearch" name="userSearch" />

Now attach Marco Polo to the input field to power the search:

    $('#userSearch').marcoPolo({
      url: '/users/search',
      formatItem: function(data) {
        return data.first_name + ' ' + data.last_name;
      },
      onSelect(data) {
        window.location = data.profile_url;
      }
    });

At this point, two transformations occur in the HTML:

1.  _autocomplete="off"_ is added to the input field to prevent the browser's
    autocomplete functionality from interfering.

2.  An empty, ordered list is created and inserted directly after the input
    field for displaying results:

        <ol class="mp_list" />

That's all the setup necessary in your HTML and JavaScript. As for CSS, the
[CSS Starter Template](https://github.com/jstayton/jquery-marcopolo/wiki/CSS-Starter-Template)
has some basic styling to get started and stubs for all of the available
classes. Also be sure to check out the
[HTML Breakdown](https://github.com/jstayton/jquery-marcopolo/wiki/HTML-Breakdown)
for a complete look into the HTML markup.

Let's turn to the _/users/search_ backend data source that's going to deliver
results. When a search happens, a GET request is made to the _url_ with _q_
(the search value) added to the query string. (Additional data can be included
using the _data_ option.) Let's say a search is made for _Butler_. A GET
request is made to _/users/search?q=Butler_. Your backend code must then use
the _q_ parameter to find the matching users and return their data as an array
of strings or JSON. Most likely you'll want to return JSON, like so:

    [
      {
        first_name: 'James',
        last_name: 'Butler',
        profile_url: '/users/78749',
        …
      },
      {
        first_name: 'Win',
        last_name: 'Butler',
        profile_url: '/users/41480',
        …
      },
      …
    ]

Using this JSON, the ordered list that was created above is populated with
results:

    <ol class="mp_list">
      <li class="mp_item mp_selectable">James Butler</li>
      <li class="mp_item mp_selectable">Win Butler</li>
      …
    </ol>

Each list item is created through the passing of a user JSON object to the
_formatItem_ callback, which in turn strings together the user's first name
and last name for display.

Finally, when a user is selected from the results list, their JSON object is
passed to the _onSelect_ callback to complete the browser redirect.

And that's it! While this example demonstrates a number of fundamental
concepts, the possibilities extend far beyond the straightforward
_search, click, redirect_ setup shown here. See what you can do!

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

    ---------------------------------------------------------------------------
*   **compare** _string, null_

    The key to use in comparing data objects. This allows the currently
    selected item to be highlighted in the results list.

    _Default:_ null

    ---------------------------------------------------------------------------
*   **data** _object, string_

    Additional data to be sent in the request query string. (Note: _q_ is
    always sent with the input value and will overwrite _q_ in the data object
    if set.)

    _Default:_ {}

    ---------------------------------------------------------------------------
*   **delay** _integer_

    The number of milliseconds to delay before firing a request after a change
    is made to the input value. This helps prevent an ajax request on every
    keystroke from overwhelming the server and slowing down the page.

    _Default:_ 250

    ---------------------------------------------------------------------------
*   **minChars** _integer_

    The minimum number of characters required before a request is fired. See
    the _formatMinChars_ callback to format the (optional) message displayed
    when this value is not reached.

    _Default:_ 1

    ---------------------------------------------------------------------------
*   **required** _boolean_

    Whether to clear the input value when no selection is made from the results
    list. This happens when the input field is blurred, usually by clicking or
    tabbing out of the field.

    _Default:_ false

    ---------------------------------------------------------------------------
*   **selectable** _selector_

    The list items to make selectable. For example, say you add the class
    _header_ to a number of list items (in the _formatItem_ callback) that you
    want to act as non-selectable headers. They can be excluded with the
    selector _:not(.header)_. Selectable items receive the class
    _mp\_selectable_.

    _Default:_ '*'

    ---------------------------------------------------------------------------
*   **selected** _object, null_

    Prime the input with a selected item. _onSelect_ is called just as if the
    item were selected from the results list.

    _Default:_ null

    ---------------------------------------------------------------------------
*   **url** _string, null_

    The URL to GET request for the results, which must be an array of strings
    or JSON. If no URL is set, the parent form's _action_ attribute value is
    used if one exists. _q_ is added to the query string with the input value,
    along with any additional _data_.

    _Default:_ null

### Callbacks

#### Formatting

*   **formatData**(data, input, $list) _function, null_

    Format the raw data that's returned from the ajax request. Useful for
    further filtering the data or returning the array of results that's
    embedded deeper in the object.

    _Default:_ null

    _Parameters:_

    *   **data** _object_ Data returned from the request.
    *   **$input** _jQuery object_ The input field element.
    *   **$list** _jQuery object_ The results list element.

    _Return:_ _array_ of _objects_ to use as the data.

    ---------------------------------------------------------------------------
*   **formatError**($item, $input, $list, jqXHR, textStatus, errorThrown)
    _function, null_

    Format the text that's displayed when the ajax request fails. The message
    is displayed in a list item with the class _mp\_error_:

        <li class="mp_error">
          <em>Your search could not be completed at this time.</em>
        </li>

    Setting this option to _null_ or returning _false_ suppresses the message
    from being displayed.

    _Default:_

        return '<em>Your search could not be completed at this time.</em>';

    _Parameters:_

    *   **$item** _jQuery object_ The list item element to display the message.
    *   **$input** _jQuery object_ The input field element.
    *   **$list** _jQuery object_ The results list element.
    *   **jqXHR** _object_ or _XMLHTTPRequest_ in jQuery 1.4.x.
    *   **textStatus** _string_ Error status of the request.
    *   **errorThrown** _string_ HTTP error status.

    _Return:_ _string_, _DOM element_, or _jQuery object_ to use as the
              message.

    ---------------------------------------------------------------------------
*   **formatItem**(data, $item, $input, $list) _function_

    Format the display of each item in the results list. By default, the
    _title_ or _name_ value of the data object is displayed. The returned value
    is added to a list item with the class _mp\_item_:

        <li class="mp_item">The Title of Something</li>

    _Default:_

        return data.title || data.name;

    _Parameters:_

    *   **data** _object_ Data returned from the request.
    *   **$item** _jQuery object_ The list item element.
    *   **$input** _jQuery object_ The input field element.
    *   **$list** _jQuery object_ The results list element.

    _Return:_ _string_, _DOM element_, or _jQuery object_ to use as the
              display.

    ---------------------------------------------------------------------------
*   **formatMinChars**(minChars, $item, $input, $list) _function, null_

    Format the text that's displayed when the minimum number of characters
    (specified with the _minChars_ option) hasn't been reached. The message is
    displayed in a list item with the class _mp\_min\_chars_:

        <li class="mp_min_chars">
          <em>Your search must be at least <strong>3</strong> characters.</em>
        </li>

    Setting this option to _null_ or returning _false_ suppresses the message
    from being displayed. It is also not displayed when there is no input
    value.

    _Default:_

        return '<em>Your search must be at least <strong>' + minChars + '</strong>characters.</em>';

    _Parameters:_

    *   **minChars** _integer_ The minimum number of characters required.
    *   **$item** _jQuery object_ The list item element to display the message.
    *   **$input** _jQuery object_ The input field element.
    *   **$list** _jQuery object_ The results list element.

    _Return:_ _string_, _DOM element_, or _jQuery object_ to use as the
              message.

    ---------------------------------------------------------------------------
*   **formatNoResults**(q, $item, $input, $list) _function, null_

    Format the text that's displayed when there are no results returned for the
    requested input value. The message is displayed in a list item with the
    class _mp\_no\_results_:

        <li class="mp_no_results">
          <em>No results for <strong>something</strong>.</em>
        </li>

    Setting this option to _null_ or returning _false_ suppresses the message
    from being displayed.

    _Default:_

        return '<em>No results for <strong>' + q + '</strong>.</em>';

    _Parameters:_

    *   **q** _string_ The requested input value.
    *   **$item** _jQuery object_ The list item element to display the message.
    *   **$input** _jQuery object_ The input field element.
    *   **$list** _jQuery object_ The results list element.

    _Return:_ _string_, _DOM element_, or _jQuery object_ to use as the
              message.

#### Events

*   **onChange**(q, $input, $list) _function, null_

    Called when the input value changes.

    _Default:_ null

    _Parameters:_

    *   **q** _string_ The changed input value.
    *   **$input** _jQuery object_ The input field element.
    *   **$list** _jQuery object_ The results list element.

    _Bind:_ You can also bind to the _marcopolochange_ event:

        $(selector).bind('marcopolochange', function(event, q, $input, $list) { … });

    ---------------------------------------------------------------------------
*   **onError**($item, $input, $list, jqXHR, textStatus, errorThrown)
    _function, null_

    Called when the ajax request fails.

    _Default: null_

    _Parameters:_

    *   **$item** _jQuery object_ The list item element to display the message.
    *   **$input** _jQuery object_ The input field element.
    *   **$list** _jQuery object_ The results list element.
    *   **jqXHR** _object_ or _XMLHTTPRequest_ in jQuery 1.4.x.
    *   **textStatus** _string_ Error status of the request.
    *   **errorThrown** _string_ HTTP error status.

    _Bind:_ You can also bind to the _marcopoloerror_ event:

        $(selector).bind('marcopoloerror', function(event, $item, $input, $list, jqXHR, textStatus, errorThrown) { … });

    ---------------------------------------------------------------------------
*   **onFocus**($input, $list) _function, null_

    Called when the input field receives focus.

    _Default: null_

    _Parameters:_

    *   **$input** _jQuery object_ The input field element.
    *   **$list** _jQuery object_ The results list element.

    _Bind:_ You can also bind to the _marcopolofocus_ event:

        $(selector).bind('marcopolofocus', function(event, $input, $list) { … });

    ---------------------------------------------------------------------------
*   **onMinChars**(minChars, $item, $input, $list) _function, null_

    Called when the minimum number of characters (specified with the _minChars_
    option) hasn't been reached by the end of the _delay_.

    _Default: null_

    _Parameters:_

    *   **minChars** _integer_ The minimum number of characters required.
    *   **$item** _jQuery object_ The list item element to display the message.
    *   **$input** _jQuery object_ The input field element.
    *   **$list** _jQuery object_ The results list element.

    _Bind:_ You can also bind to the _marcopolominchars_ event:

        $(selector).bind('marcopolominchars', function(event, minChars, $item, $input, $list) { … });

    ---------------------------------------------------------------------------
*   **onNoResults**(q, $item, $input, $list) _function, null_

    Called when there are no results returned for the request.

    _Default: null_

    _Parameters:_

    *   **q** _string_ The requested input value.
    *   **$item** _jQuery object_ The list item element to display the message.
    *   **$input** _jQuery object_ The input field element.
    *   **$list** _jQuery object_ The results list element.

    _Bind:_ You can also bind to the _marcopolonoresults_ event:

        $(selector).bind('marcopolonoresults', function(event, q, $item, $input, $list) { … });

    ---------------------------------------------------------------------------
*   **onRequestBefore**($input, $list) _function, null_

    Called before the ajax request is made. Useful for showing a loading
    spinner if the request is going to take some time.

    _Default: null_

    _Parameters:_

    *   **$input** _jQuery object_ The input field element.
    *   **$list** _jQuery object_ The results list element.

    _Bind:_ You can also bind to the _marcopolorequestbefore_ event:

        $(selector).bind('marcopolorequestbefore', function(event, $input, $list) { … });

    ---------------------------------------------------------------------------
*   **onRequestAfter**($input, $list, jqXHR, textStatus) _function, null_

    Called after the ajax request completes (success or error). Useful for
    hiding a loading spinner that's shown in _onRequestBefore_.

    _Default: null_

    _Parameters:_

    *   **$input** _jQuery object_ The input field element.
    *   **$list** _jQuery object_ The results list element.
    *   **jqXHR** _object_ or _XMLHTTPRequest_ in jQuery 1.4.x.
    *   **textStatus** _string_ Status of the request.

    _Bind:_ You can also bind to the _marcopolorequestafter_ event:

        $(selector).bind('marcopolorequestafter', function(event, $input, $list, jqXHR, textStatus) { … });

    ---------------------------------------------------------------------------
*   **onResults**(data, $input, $list) _function, null_

    Called when there are results to be displayed.

    _Default: null_

    _Parameters:_

    *   **data** _object_ Data returned from the request.
    *   **$input** _jQuery object_ The input field element.
    *   **$list** _jQuery object_ The results list element.

    _Bind:_ You can also bind to the _marcopoloresults_ event:

        $(selector).bind('marcopoloresults', function(event, data, $input, $list) { … });

    ---------------------------------------------------------------------------
*   **onSelect**(data, $item, $input, $list) _function, null_

    Called when an item is selected from the results list or passed in through
    the _selected_ option. By default, the _title_ or _name_ value of the data
    object is used to populate the input value.

    _Default:_

        $input.val(data.title || data.name);

    _Parameters:_

    *   **data** _object_ Data returned from the request.
    *   **$item** _jQuery object, null_ The selected results list item element.
                                        _null_ if _selected_ option used.
    *   **$input** _jQuery object_ The input field element.
    *   **$list** _jQuery object_ The results list element.

    _Bind:_ You can also bind to the _marcopoloselect_ event:

        $(selector).bind('marcopoloselect', function(event, data, $item, $input, $list) { … });

Methods
-------

*   **change**

    Programmatically change the input value without triggering a search request
    (use the _search_ method for that). If the value is different than the
    current input value, the _onChange_ callback is fired.

    _Example:_

        $('#userSearch').marcoPolo('change', 'Wilson');

    _Parameters:_

    *   **q** _string_ New input value.

*   **destroy**

    Remove the autocomplete functionality and return the selected input
    fields to their original state.

    _Example:_

        $('#userSearch').marcoPolo('destroy');

*   **option**

    Get or set one or more options.

    _Example:_

    Get a specific option:

        $('#userSearch').marcoPolo('option', 'url');

    Get the entire options object:

        $('#userSearch').marcoPolo('option');

    Set a specific option:

        $('#userSearch').marcoPolo('option', 'url', '/new/url');

    Set multiple options:

        $('#userSearch').marcoPolo('option', {
          url: '/new/url',
          onSelect: function(data, $item, $input, $list) { … }
        });

    _Parameters:_

    *   **nameOrValues** _string, object_ Optional options to get or set.
    *   **value** _mixed_ Optional option value to set.

*   **search**

    Programmatically trigger a search request using the existing input value
    or a new one. The input receives focus to allow for keyboard navigation.

    _Example:_

    Trigger a search on the existing input value:

        $('#userSearch').marcoPolo('search');

    Trigger a search on a new value:

        $('#userSearch').marcoPolo('search', 'Wilson');

    _Parameters:_

    *   **q** _string_ Optional new input value to search on.

Feedback
--------

Please open an issue to request a feature or submit a bug report. Or even if
you just want to provide some feedback, I'd love to hear.