
function submit(){
    var to = $("#to").val();
    var from = $("#from").val();

    $.ajax("/sendmail?to="+ to + "&" + "from=" + from,{
        success:removeAll,
        error:function(err){alert("Bad from/to address")}
});}


var removeAll;
$('fromto').submit(function(){
   removeAll();
});
Dropzone.options.fileuploadzone = {
    init:function(){
        var that = this;
        removeAll = function(){
            that.removeAllFiles();
            console.log("RemoveAll")
        }
    }

    //addRemoveLinks: true,
    //
    //removedfile: function(file) {
    //    var _ref;
    //    $.ajax("/deleteFile",{
    //        method:"POST",
    //        data:file.filename,
    //        error:function(err){console.log("can't delete from  server.., " + err)}
    //    });
    //    return (_ref = file.previewElement) != null ? _ref.parentNode.removeChild(file.previewElement) : void 0;
    //}
}