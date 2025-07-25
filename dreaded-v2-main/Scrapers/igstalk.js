const axios = require('axios');

async function igStalk(username) {
  const formData = new URLSearchParams();
  formData.append('profile', username);

  try {
    const profileRes = await axios.post('https://tools.xrespond.com/api/instagram/profile-info', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'origin': 'https://bitchipdigital.com',
        'referer': 'https://bitchipdigital.com/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      }
    });

    const raw = profileRes.data?.data?.data;
    if (!raw || profileRes.data.status !== 'success') throw new Error('emror');

    const followers = raw.follower_count ?? 0;

    const postsForm = new URLSearchParams();
    postsForm.append('profile', username);

    const postsRes = await axios.post('https://tools.xrespond.com/api/instagram/media/posts', postsForm.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'origin': 'https://bitchipdigital.com',
        'referer': 'https://bitchipdigital.com/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      }
    });

    const items = postsRes.data?.data?.data?.items || [];

    let totalLike = 0;
    let totalComment = 0;

    for (const post of items) {
      totalLike += post.like_count || 0;
      totalComment += post.comment_count || 0;
    }

    const totalEngagement = totalLike + totalComment;
    const averageEngagementRate = followers > 0 && items.length > 0
      ? ((totalEngagement / items.length) / followers) * 100
      : 0;

    return {
      username: raw.username || '-',
      name: raw.full_name || '-',
      bio: raw.biography || '-',
      followers,
      following: raw.following_count ?? null,
      posts: raw.media_count ?? null,
      profile_pic: raw.hd_profile_pic_url_info?.url || raw.profile_pic_url_hd || '',
      verified: raw.is_verified || raw.show_blue_badge_on_main_profile || false,
      engagement_rate: parseFloat(averageEngagementRate.toFixed(2))
    };

  } catch (err) {
    return { error: true, message: err.message };
  }
}

module.exports = { igStalk };