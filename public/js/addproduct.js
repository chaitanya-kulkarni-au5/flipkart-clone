$(document).ready(function () {
    $('#addhighlight').click(function (){
        var form = $('#form').val()
        $('<input type="text" class="form-control mt-3 highlights" name="highlights" placeholder="Add Highlight">').insertBefore($('#addhighlight'))
        


    })
});