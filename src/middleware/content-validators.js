/**
 * 内容端点通用校验
 * 供 announcements.js / doc.js / project.js / activity.js 共用
 */

import { sanitizeCoverImageUrl } from './upload-image.js';
import { MAX_TITLE_LENGTH, MAX_CONTENT_LENGTH } from '../constants.js';

function checkTitleAndContent(title, content) {
    if (typeof title !== 'string' || title.trim() === '') {
        return { status: 400, message: '标题不能为空' };
    }
    if (title.length > MAX_TITLE_LENGTH) {
        return { status: 400, message: `标题不能超过 ${MAX_TITLE_LENGTH} 个字符` };
    }
    if (typeof content !== 'string' || content.trim() === '') {
        return { status: 400, message: '内容不能为空' };
    }
    if (content.length > MAX_CONTENT_LENGTH) {
        return { status: 400, message: `内容不能超过 ${MAX_CONTENT_LENGTH} 个字符` };
    }
    return null;
}

/**
 * 校验并清洗 title / content（公告）
 */
export function validateAndSanitizeAnnouncement(body) {
    const { title, content } = body;
    const err = checkTitleAndContent(title, content);
    if (err) return { error: err };
    return {
        data: {
            title: title.trim(),
            content
        }
    };
}

/**
 * 校验并清洗 title / content / cover_image_url（doc/project/activity）
 */
export function validateAndSanitizeContent(body) {
    const { title, content, cover_image_url } = body;
    const err = checkTitleAndContent(title, content);
    if (err) return { error: err };

    return {
        data: {
            title: title.trim(),
            content,
            cover_image_url: sanitizeCoverImageUrl(cover_image_url)
        }
    };
}
