/*

Need jQuery

*/

$(document).ready(function ()
{
	$("a[href='#']:not(.dropdown-toggle)").click(function (event)
	{
		event.preventDefault();
		alert("[" + $(this).text() + "]\nComing soon");
	});
	
	// $(document).on('scroll', function ()
	// {
	// 	if ($("#header").length)
	// 	{
	// 		if (window.scrollY > 20)
	// 		{
	// 			$("#header")
	// 				.addClass('scrolled')
	// 				.addClass('navbar-light')
	// 				.removeClass('navbar-dark')
	// 				.addClass('bg-light')
	// 				.removeClass('bg-dark')
	// 				.addClass('border-bottom');
	// 			$("#header .btn-outline-light")
	// 				.addClass('btn-outline-dark')
	// 				.removeClass('btn-outline-light');
	// 		}
	// 		else
	// 		{
	// 			$("#header")
	// 				.removeClass('scrolled')
	// 				.removeClass('navbar-light')
	// 				.addClass('navbar-dark')
	// 				.removeClass('bg-light')
	// 				.addClass('bg-dark')
	// 				.removeClass('border-bottom');
	// 			$("#header .btn-outline-dark")
	// 				.addClass('btn-outline-light')
	// 				.removeClass('btn-outline-dark');
	// 		}
	// 	}
	// });
});
