<?php

function protocol()
{
    return ((isset($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off')
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https')
        || (isset($_SERVER['HTTP_X_SCHEME']) && strtolower($_SERVER['HTTP_X_SCHEME']) === 'https')
    ) ? 'https' : 'http';
}

function url()
{
    return sprintf(
        "%s://%s%s",
        protocol(),
        $_SERVER['HTTP_HOST'],
        preg_replace('/\/(htdocs|www)/', '', dirname($_SERVER['SCRIPT_NAME']))
    );
}

function isVK()
{
    return testUserAgent('vkShare');
}

function isOK()
{
    return testUserAgent('OdklBot|odnoklassniki.ru');
}

function isFB()
{
    return testUserAgent('facebookexternalhit');
}

function isTwitter()
{
    return testUserAgent('Twitterbot') && !isTg();
}

function isTg()
{
    return testUserAgent('TelegramBot');
}

function isWhatsApp()
{
    return testUserAgent('WhatsApp');
}

function isViber()
{
    return testUserAgent('Viber');
}

function testUserAgent($str)
{
    return stripos($_SERVER['HTTP_USER_AGENT'], $str) !== false;
}

function isSocial()
{
    return isVK() || isOK() || isFB() || isTwitter() || isTg() || isWhatsApp() || isViber();
}

function _bot_detected()
{
    return (
        isset($_SERVER['HTTP_USER_AGENT'])
        && preg_match('/bot|crawl|slurp|spider|mediapartners/i', $_SERVER['HTTP_USER_AGENT'])
    );
}

function request_url()
{
    return sprintf(
        "%s://%s%s",
        protocol(),
        $_SERVER['HTTP_HOST'],
        htmlspecialchars($_SERVER['REQUEST_URI'])
    );
}

function base_url($val)
{
    return url() . $val;
}

function getShare()
{
    $result = new stdClass();
    $result->title = 'title';
    $result->description = 'description';
    $version = "?0.0.1";
    $result->image = array(
        'fb' => base_url("/images/share/share_fb.png" . $version),
        'ok' => base_url("/images/share/share_fb.png" . $version),
        'tw' => base_url("/images/share/share_fb.png" . $version),
        'vk' => base_url("/images/share/share_vk.png" . $version)
    );
    $result->canonical_url = request_url();

    if (isVK() || isViber()) {
        $result->title .= ' ' . $result->description;
    }
    return $result;
}
$formaction = '';
if (!_bot_detected() && !isSocial()) {
    header("Location: http://" . $_SERVER['HTTP_HOST'] . $formaction);
}

$share = getShare();
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <title><?= $share->title ?></title>
    <meta content="website" property="og:type">
    <meta content="<?= $share->canonical_url ?>" property="og:url">
    <meta content="<?= $share->title ?>" property="og:title">
    <meta content="<?= $share->description ?>" property="og:description">
    <meta content="<?= $share->image['fb'] ?>" property="og:image">
    <meta content="<?= $share->image['vk'] ?>" property="vk:image">
    <meta content="<?= $share->image['tw'] ?>" property="twitter:image">
    <meta content="<?= $share->image['fb'] ?>" name="og:image">
    <meta content="<?= $share->image['vk'] ?>" name="vk:image">
    <meta content="<?= $share->image['tw'] ?>" name="twitter:image">
    <meta content="1200" property="og:image:width">
    <meta content="630" property="og:image:height">
    <meta content="summary_large_image" name="twitter:card">
    <meta charset="utf-8">
    <meta name="description" content="<?= $share->description ?>">
    <meta name="viewport" content="width=device-width">
    <meta name="mobile-web-app-capable" content="yes">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <link rel="apple-touch-icon" href="apple-touch-icon.png">
    <link rel="icon" href="favicon.ico">
</head>
<body>
</body>
</html>
