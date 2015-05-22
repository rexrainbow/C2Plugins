Parse.Cloud.define("C2RexGetCurrentTime", function(request, response) {
    var timestamp = new Date().getTime();
    response.success(timestamp);
});