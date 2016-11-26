export default function excessiveCare (cm, change) {

	if (
    change.origin === "+input" ||
    change.origin === "*compose" /*||
    change.origin === "paste"*/
  ) {
		var matchFlag = false;
		var replaced = [];
		change.text.forEach(function(input){
			if(input.match(/[！-～|。|、|”|’]/g)){
				var han = input.replace(/[！-～]/g, function(s){
					return String.fromCharCode(s.charCodeAt(0)-0xFEE0);
				});
				han = han.replace(/。/g, function(s){ return "."; });
				han = han.replace(/、/g, function(s){ return ","; });
				han = han.replace(/”/g, function(s){ return "\""; });
				han = han.replace(/’/g, function(s){ return "\'"; });
				replaced.push(han);
				matchFlag = true;
			}else{
				replaced.push(input);
			}
		});
		if(matchFlag){
			change.update(change.from, change.to, replaced, "");
		}
	}

	if (change.origin == "+delete" && change.to.ch - change.from.ch == 1) {
		var del = cm.doc.getRange(change.from, change.to);
		if (del.match(/[,;=\(\)\[\]\']/g)) {
			change.cancel();
		}
	}

};
