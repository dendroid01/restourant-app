<?php

namespace App\Services;

use HTMLPurifier;
use HTMLPurifier_Config;

class HtmlSanitizerService
{
    private HTMLPurifier $purifier;

    public function __construct()
    {
        $config = HTMLPurifier_Config::createDefault();
        $config->set('HTML.Allowed',
            'p,br,strong,em,s,u,h1,h2,h3,h4,ul,ol,li,blockquote,hr,a[href|target|rel]'
        );
        $config->set('HTML.TargetBlank', true);
        $config->set('URI.AllowedSchemes', ['http' => true, 'https' => true]);
        $config->set('Cache.SerializerPath', storage_path('app/purifier'));

        $this->purifier = new HTMLPurifier($config);
    }

    public function clean(?string $html): ?string
    {
        if (empty($html)) return $html;
        return $this->purifier->purify($html);
    }
}
