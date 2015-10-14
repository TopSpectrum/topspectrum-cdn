<?php

require_once "Mail.php";
require_once ('Mail/mime.php');

$registar_id = isset($_POST['registrar-id']) ? $_POST['registrar-id'] : '';
$registrar_name = isset($_POST['registrar-name']) ? $_POST['registrar-name'] : '';
$website_url = isset($_POST['website-url']) ? $_POST['website-url'] : '';
$country = isset($_POST['country']) ? $_POST['country'] : '';
$contact_name = isset($_POST['contact-name']) ? $_POST['contact-name'] : '';
$phone_number = isset($_POST['phone-number']) ? $_POST['phone-number'] : '';
$icann_accredited = isset($_POST['icann-accredited']) ? $_POST['icann-accredited'] : '';
$centralnic_accredited = isset($_POST['centralnic-accredited']) ? $_POST['centralnic-accredited'] : '';
$email_address = isset($_POST['email-address']) ? $_POST['email-address'] : '';

$headers = 'From: ops@topspectrum.com' . "\r\n" .
    'Reply-To: ops@topspectrum..com' . "\r\n";

$body = "<html><p>registrar-id: {$registar_id}</p>\n" .
            "<p>registrar-name: {$registrar_name}</p>\n" .
            "<p>website-url: {$website_url}</p>\n" .
            "<p>country: {$country}</p>\n" .
            "<p>contact-name: {$contact_name}</p>\n" .
            "<p>phone-number: {$phone_number}</p>\n" .
            "<p>email-address: {$email_address}</p>\n" .
            "<p>icann: {$icann_accredited}</p>\n" .
            "<p>centralnic: {$centralnic_accredited}</p></html>\n ";


$host = "email-smtp.us-west-2.amazonaws.com:587";
$username = "AKIAJ4ATOGMGDPKH5PZQ";
$password = "AkkQMxRrbZ0uCcQIrOrn7r4ulqvQpDdFNmYeRH6tTVHc";

$from = "ops@topspectrum.com";
$to = "ops@topspectrum.com";

$headers = array('From' => $from, 'To' => $to, 'Subject' => "Registrar Inquiry", 'MIME-Version' => 1, 'Content-type' => 'text/html;charset=iso-8859-1' );

$smtp = Mail::factory('smtp', array ('host' => $host,
                                     'auth' => true,
                                     'debug' => true,
                                     'username' => $username,
                                     'password' => $password));

error_log($to);
error_log($username);
error_log($password);
error_log($body);

$mail = $smtp->send($to, $headers, $body);
if (PEAR::isError($mail)) { 
	error_log("ERROR");
 	error_log($mail->getMessage());
}

exit(header("Status: 200 OK"));

?>
