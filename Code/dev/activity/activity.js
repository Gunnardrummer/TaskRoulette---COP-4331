function ActControl($scope){
    var properties = ["name","time","description", "category", "done"];
    var activity = {};

    for(var i in properties){
        activity[properties[i]]=properties[i];
    }

    $scope.actModel = activity;

    $scope.props = properties;

	$scope.acts = [
		{name:"test", time:"30", description:"", category:"aasdf", done:true},
		{name:"test", time:"30", description:"", category:"aasdf", done:true}
	];

	$scope.addAct = function(){
		$scope.acts.push({name:$scope.name,time:$scope.time,description:$scope.description,category:$scope.category,done:false});
		//clearing model
        for(var i in properties){
            $scope[properties[i]] = "";
        }
	};
}