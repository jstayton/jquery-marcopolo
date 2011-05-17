Marco Polo
==========

A modern jQuery plugin for adding autocomplete functionality to an input field.

Huh? Why?
---------

Requirements
------------

jQuery 1.4.2 or newer.

How it Works
------------

Options
-------

*   **cache** _boolean_

    Whether to cache query results. The cache is shared by all instances, which
    is a big advantage when many of the same field type appear on the same
    page. For example, a tags field that's repeated for every record on a page.

    _Default: true_

    ---------------------------------------------------------------------------
*   **compare** _string, null_

    The key to use in comparing data objects. This allows the currently
    selected item to be highlighted in the results list.

    _Default: null_

    ---------------------------------------------------------------------------
*   **data** _object, string_

    Additional data to be sent in the request query string. (Note: _q_ is
    always sent with the input value and will overwrite _q_ in the data object
    if set.)

    _Default: {}_

    ---------------------------------------------------------------------------
*   **delay** _integer_

    The number of milliseconds to delay before firing a request after a change
    is made to the input field value. This helps prevent a request on every
    keystroke.

    _Default: 250_

    ---------------------------------------------------------------------------
*   **minChars** _integer_

    The minimum number of characters required in the input field for a request
    to happen. See the _formatMinChars_ callback to format the (optional)
    message displayed when this value is not reached.

    _Default: 1_

    ---------------------------------------------------------------------------
*   **required** _boolean_

    Whether to clear the input field value when no selection is made from the
    results list.

    _Default: false_

    ---------------------------------------------------------------------------
*   **selectable** _selector_

    The list items to make selectable. For example, this allows items with a
    certain class — like all headers with the class _header_ — to be excluded.

    _Default: '*'_

    ---------------------------------------------------------------------------
*   **selected** _object, null_

    Prime the input with a selected item. _onSelect_ is called just as if the
    item were selected from the results list.

    _Default: null_

    ---------------------------------------------------------------------------
*   **url** _string, null_

    The URL to request for the results. If no URL is set, the parent form's
    _action_ attribute value is used if one exists. _q_ is added to the query
    string with the input value.

    _Default: null_

### Callbacks

#### Formatting

*   **formatError**($item, $input, $list, jqXHR, textStatus, errorThrown)
    _function, null_

    Format the text that's displayed when the ajax request fails. Setting this
    option to _null_ suppresses the message from being displayed.

    _Default:_

        return '<em>Your search could not be completed at this time.</em>';

    ---------------------------------------------------------------------------
*   **formatItem**(json, $item, $input, $list) _function_

    Format the display of each item in the results list. By default, the
    _title_ or _name_ value of the data object is displayed.

    _Default:_

        return json.title || json.name;

    ---------------------------------------------------------------------------
*   **formatMinChars**(minChars, $item, $input, $list) _function, null_

    Format the text that's displayed when the minimum number of characters
    (specify with the _minChars_ option) hasn't been reached. Setting this
    option to _null_ suppresses the message from being displayed.

    _Default:_

        return '<em>Your search must be at least <strong>' + minChars + '
        </strong>characters.</em>';

    ---------------------------------------------------------------------------
*   **formatNoResults**(q, $item, $input, $list) _function, null_

    Format the text that's displayed when there are no results to display for
    the query. Setting this option to _null_ suppresses the message from being
    displayed.

    _Default:_

        return '<em>No results for <strong>' + q + '</strong>.</em>';

#### Events

*   **onChange**(q, $input, $list) _function, null_

    Called when the input value changes.

    _Default: null_

    ---------------------------------------------------------------------------
*   **onFocus**($input, $list) _function, null_

    Called when the input field receives focus.

    _Default: null_

    ---------------------------------------------------------------------------
*   **onRequestBefore**($input, $list) _function, null_

    Called before the request is made.

    _Default: null_

    ---------------------------------------------------------------------------
*   **onRequestAfter**($input, $list, jqXHR, textStatus) _function, null_

    Called after the request completes successfully.

    _Default: null_

    ---------------------------------------------------------------------------
*   **onSelect**(json, $item, $input, $list) _function, null_

    Called when an item is selected from the results list or passed in through
    the _selected_ option. By default, the _title_ or _name_ values of the data
    object is used to populate the input value.

    _Default:_

        $input.val(json.title || json.name);