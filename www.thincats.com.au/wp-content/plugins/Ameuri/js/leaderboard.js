function setTab(a) {
	if(a == 'ind') {
		jQuery('#indID').addClass('selected');
		jQuery('#grID').removeClass('selected');
		jQuery('#iInfo').css('display', 'block');
		jQuery('#grInfo').css('display', 'none');
	} else if(a == 'gr') {	
		jQuery('#grID').addClass('selected');
		jQuery('#indID').removeClass('selected');
		jQuery('#iInfo').css('display', 'none');
		jQuery('#grInfo').css('display', 'block');
	}
}