<?php
/**
 * Plugin Name: FlipBook Viewer
 * Description: Lightweight flipbook viewer with a toolbar inspired by popular PDF flipbook interfaces.
 * Version: 1.0.0
 * Author: FlipBook Team
 * License: GPL-2.0-or-later
 */

if (!defined('ABSPATH')) {
    exit;
}

define('FLIPBOOK_VIEWER_VERSION', '1.0.0');

define('FLIPBOOK_VIEWER_URL', plugin_dir_url(__FILE__));

define('FLIPBOOK_VIEWER_PATH', plugin_dir_path(__FILE__));

function flipbook_viewer_register_assets(): void
{
    wp_register_style(
        'flipbook-viewer',
        FLIPBOOK_VIEWER_URL . 'assets/flipbook.css',
        array(),
        FLIPBOOK_VIEWER_VERSION
    );

    wp_register_script(
        'flipbook-viewer',
        FLIPBOOK_VIEWER_URL . 'assets/flipbook.js',
        array(),
        FLIPBOOK_VIEWER_VERSION,
        true
    );
}
add_action('init', 'flipbook_viewer_register_assets');

function flipbook_viewer_shortcode($atts): string
{
    $atts = shortcode_atts(
        array(
            'images' => '',
            'title' => 'FlipBook',
        ),
        $atts,
        'flipbook'
    );

    $images = array_filter(array_map('trim', explode(',', $atts['images'])));
    if (empty($images)) {
        $images = array(
            FLIPBOOK_VIEWER_URL . 'assets/sample-page-1.svg',
            FLIPBOOK_VIEWER_URL . 'assets/sample-page-2.svg',
            FLIPBOOK_VIEWER_URL . 'assets/sample-page-3.svg',
            FLIPBOOK_VIEWER_URL . 'assets/sample-page-4.svg',
        );
    }

    wp_enqueue_style('flipbook-viewer');
    wp_enqueue_script('flipbook-viewer');

    $instance_id = wp_unique_id('flipbook-viewer-');

    ob_start();
    ?>
    <div class="flipbook-viewer" id="<?php echo esc_attr($instance_id); ?>" data-images="<?php echo esc_attr(wp_json_encode($images)); ?>">
        <div class="flipbook-viewer__header">
            <span class="flipbook-viewer__badge">envato market</span>
            <span class="flipbook-viewer__title"><?php echo esc_html($atts['title']); ?></span>
            <div class="flipbook-viewer__header-actions">
                <button class="flipbook-viewer__action" type="button" data-action="close" aria-label="Close">×</button>
            </div>
        </div>
        <div class="flipbook-viewer__stage">
            <button class="flipbook-viewer__nav flipbook-viewer__nav--prev" type="button" data-action="prev" aria-label="Previous page">‹</button>
            <div class="flipbook-viewer__spread">
                <div class="flipbook-viewer__page flipbook-viewer__page--left"></div>
                <div class="flipbook-viewer__page flipbook-viewer__page--right"></div>
            </div>
            <button class="flipbook-viewer__nav flipbook-viewer__nav--next" type="button" data-action="next" aria-label="Next page">›</button>
        </div>
        <div class="flipbook-viewer__toolbar">
            <button type="button" class="flipbook-viewer__tool" data-action="zoom-out" aria-label="Zoom out">−</button>
            <div class="flipbook-viewer__counter">
                <span data-counter="current">1</span>
                <span>/</span>
                <span data-counter="total">1</span>
            </div>
            <button type="button" class="flipbook-viewer__tool" data-action="zoom-in" aria-label="Zoom in">＋</button>
            <button type="button" class="flipbook-viewer__tool" data-action="fit" aria-label="Fit to screen">▢</button>
            <button type="button" class="flipbook-viewer__tool" data-action="fullscreen" aria-label="Fullscreen">⛶</button>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('flipbook', 'flipbook_viewer_shortcode');
