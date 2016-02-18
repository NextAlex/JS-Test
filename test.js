/*
 * Field rows count
 */
var rows = 7;
/*
 * Field columns count
 */
var cols = 7;
/*
 * Field cell size in pixels
 */
var cellSize = 50;
/*
 * Default directions to search match
 */
var directionsDefault = [{ row: 0, col: 1}, { row: 0, col: -1}, { row: 1, col: 0 }, { row: -1, col: 0 }];
/*
 * Extended directions to search match ( including diagonals )
 */
var directionsExtended = [{ row: 0, col: 1}, { row: 0, col: -1}, { row: 1, col: 0 }, { row: -1, col: 0 }, { row: 1, col: 1}, { row: -1, col: -1}, { row: 1, col: -1 }, { row: -1, col: 1 }];
/*
 * Directions var used during search
 */
var directions = directionsDefault;


/*
 * Bulids the field and displays it on the page
 */
function buildField(){
    /// Get requested field rows count
    rows = document.getElementById( 'rowsNum' ).value;
    /// Get requested field columns count
    cols = document.getElementById( 'colsNum' ).value;
    /// Get content element to build the fiel inside
    var Content = document.getElementById( 'Content' );
    /// Cleanup the content element
    while ( Content.firstChild ) {
        Content.removeChild( Content.firstChild );
    }
    /// Create the field
    var field = document.createElement( 'div' );
    field.className = 'field';
    field.style.width = cols*cellSize + 'px';
    field.style.height = rows*cellSize + 'px';
    /// Fill up the field with cells
    for( i = 0; i < rows*cols; ++i )
    {
        var cell = document.createElement( 'div' );
        cell.setAttribute( 'number', parseInt( Math.random() * 5 ) );
        cell.style.width = cellSize + 'px';
        cell.style.height = cellSize + 'px';
        field.appendChild( cell );
    }
    /// Set the mouse click handler
    field.onclick = onCellClick;
    
    Content.appendChild( field );
}

/*
 * Called on click event
 * 
 * @param {event} event - Click event from the engine
 */
function onCellClick( event ){
    /// Get the clicked element
    var elem = event.target;
    /// Mark it
    elem.classList.add( 'selected' );
    /// Check if diagonals must used during processing
    if ( document.getElementById( 'diagonalDirections' ).checked ){
        directions = directionsExtended;
    }else{
        directions = directionsDefault;
    }
    /// Get the cells 2D array
    var arr = getAs2DArray();
    var rowIndex = 0;
    var colIndex = 0;
    /// Find the clicked element location
    for( ; rowIndex < arr.length; ++rowIndex ){
        colIndex = arr[ rowIndex ].indexOf( elem );
        if ( colIndex > -1 ){
            arr[ rowIndex ][ colIndex ].classList.add( 'selected' );
            break;
        }
    }
    /// Perform the search
    var res = findSameValues( arr, rowIndex, colIndex );
    /// Display the search result to user in the text form
    document.getElementById( 'Result' ).innerHTML = 'Results( ' + res.objects.length + ' ):<BR/>' + res.idxs.join( '<BR/> ' );
    /// Display the search results in the graphical form
    for( var idx in res.objects )
    {
        res.objects[idx].classList.add( 'found' );
    }
}

/*
 * Performs search for the elements with same value as clicked element
 * 
 * @param {Array} theArray - 2D array of cell elements
 * @param {number} startRow - Row index of the starting cell
 * @param {number} startCol - Column index of the starting cell
 * @return {object} Search result as found DOM elements and their field indexes in the following form:
 * { objects: [ node1, node2 ], idxs: [ [ 1, 0 ], [ 3, 5 ] ] }
 */
function findSameValues( theArray, startRow, startCol ){
    /// Resulting array with found elements and their indexes
    var result = { objects: Array(), idxs: Array() };
    /// Starting element. Should not be present in the results
    var startElement = theArray[ startRow ][ startCol ];
    /// The number from the starting element. Needed for comparison
    var theNumber = startElement.getAttribute( 'number' );
    
    
    /*
     * Recursive function to search for the matching elements
     * 
     * @param {number} rowNum - Row index of the testing cell
     * @param {number} colNum - Column index of the testing cell
     */
    function searchIt( rowNum, colNum ){
        var currentElement = theArray[ rowNum ][ colNum ];
        if ( theNumber === currentElement.getAttribute( 'number' ) ) {
            if ( startElement !== currentElement ) {
                result.objects.push( theArray[ rowNum ][ colNum ] );
                result.idxs.push( [ rowNum, colNum ] );
            }
            /// Go to the possible directions
            for ( var idx in directions ){
                /// Coordinates og the next cell to test
                var nextRow = rowNum + directions[ idx ].row;
                var nextCol = colNum + directions[ idx ].col;
                /// Bounds check
                if ( ( nextRow >= 0 && nextCol >= 0 ) && ( nextRow < rows && nextCol < cols ) ) {
                    /// If the item was not found before
                    if( result.objects.indexOf( theArray[ nextRow ][ nextCol ] ) == -1 ) {
                        /// Start testing the cell
                        searchIt( nextRow, nextCol );
                    }
                }
            }
        }
    }
    /// Execute the search from the clicked cell
    searchIt( startRow, startCol );
    
    return result;
}

/*
 * Obtains list of the cell elements inside the field and transforms it to 2D array
 * 
 * @return {Array} @d array of the DOM elements
 */
function getAs2DArray()
{
    /// Resulting array
    var Result = Array();
    /// Execute the elements selection by xPath 
    var xPathRes = document.evaluate( '//*[@id="Content"]/div/div', document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
    var rowIndex = 0;
    var colIndex = 0;
    /// First sub-array
    Result.push( Array() );
    for( var i = 0; i < xPathRes.snapshotLength; ++i ) {
      /// Get element from the xPath results list
      var thisNode = xPathRes.snapshotItem( i );
      /// If sub-array is full of data increase the row index and create next sub-array
      if ( colIndex > cols - 1 ){
          colIndex = 0;
          ++rowIndex;
          Result.push( Array() );
      }
      /// Append the element to resulting array
      Result[ rowIndex ].push( thisNode );
      ++colIndex;
    }
    
    return Result;
}



window.onload = function(){
    /// Build the default field
    buildField();
    /// Set the refresh button click handler
    document.getElementById( 'buildField' ).onclick = buildField;
}
