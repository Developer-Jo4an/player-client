<?php

const API_CACHE_LIFETIME = '+1 week';

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

function api($method, $fields = array(), $post = 0)
{
    if (!file_exists(__DIR__ . '/assets/')) {
        @mkdir($concurrentDirectory = __DIR__ . '/assets/', 0777, true);
    }
    $cachePath = __DIR__ . '/assets/' . md5($method . implode('', $fields) . $post) . '.json';

    if (file_exists($cachePath) && (filectime($cachePath) + strtotime(API_CACHE_LIFETIME) > time())) {
        return json_decode(file_get_contents($cachePath), true);
    }
    if (file_exists(__DIR__ . '/api/index-api.php')) {
        /** @var \yii\web\Application $yiiApp */
        $yiiApp = require __DIR__ . '/api/index-api.php';
        $_SESSION['__REQUEST_URI__'] = '/api/v1' . $method;
        $response = $yiiApp->runAction('/v1' . $method, $fields);
        if (empty($response['data'])) {
            $response['data'] = $response;
        }
        $data = json_encode($response);
        file_put_contents($cachePath, $data);
        return json_decode($data, true);
    }
    $url = base_url("/api/v1" . $method);
    $fields_string = http_build_query($fields);

    //open connection
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, $post);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    if (curl_errno($ch)) {
        var_dump(curl_error($ch));
    }
    curl_close($ch);

    file_put_contents($cachePath, $response);
    return json_decode($response, true);
}

function isVK()
{
    return testUserAgent('vkShare');
}

function isOK()
{
    return testUserAgent(
        'OdklBot|odnoklassniki.ru'
    );
}

function isFB()
{
    return testUserAgent(
        'facebookexternalhit'
    );
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
    $result->title = 'Заголовок';
    $result->description = 'Описание';
    $version = "?0.0.1";
    $result->image = array(
        'fb' => base_url("images/share/base.png" . $version),
        'ok' => base_url("images/share/base.png" . $version),
        'tw' => base_url("images/share/base.png" . $version),
        'vk' => base_url("images/share/vk.png" . $version)
    );
    $result->canonical_url = request_url();

    if (isVK() || isViber()) {
        $result->title .= ' ' . $result->description;
    }
    return $result;
}

function className($list)
{
    $result = array();
    foreach ($list as $key => $value) {
        if ($value) {
            $result[] = $key;
        }
    }
    return implode(" ", $result);
}

$share = getShare();
?>
