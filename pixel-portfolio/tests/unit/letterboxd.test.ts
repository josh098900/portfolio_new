import { describe, expect, it } from "vitest";
import { decodeEntities, parseFeed, posterAt } from "@/lib/letterboxd";

const item = (body: string) => `<item>${body}</item>`;
const poster = "https://a.ltrbxd.com/resized/film-poster/1/2/3/123-film-0-600-0-900-crop.jpg?v=abc";

// Shaped like Letterboxd's real feed: diary entries, a list, and some bad data.
const feed = `<?xml version='1.0' encoding='utf-8'?>
<rss version="2.0" xmlns:letterboxd="https://letterboxd.com" xmlns:tmdb="https://themoviedb.org"><channel>
${item(`<title>Before Sunrise, 1995 - ★★★★½</title>
  <link>https://letterboxd.com/someone/film/before-sunrise/</link>
  <guid isPermaLink="false">letterboxd-review-1</guid>
  <letterboxd:watchedDate>2026-10-18</letterboxd:watchedDate>
  <letterboxd:rewatch>Yes</letterboxd:rewatch>
  <letterboxd:filmTitle>Before Sunrise</letterboxd:filmTitle>
  <letterboxd:filmYear>1995</letterboxd:filmYear>
  <letterboxd:memberRating>4.5</letterboxd:memberRating>
  <letterboxd:memberLike>Yes</letterboxd:memberLike>
  <description><![CDATA[ <p><img src="${poster}"/></p> <p>Two strangers &amp; one night in Vienna. It&#039;s &quot;perfect&quot;.</p><p>Second paragraph.</p> ]]></description>`)}
${item(`<title>Heat, 1995</title>
  <link>https://letterboxd.com/someone/film/heat-1995/</link>
  <guid isPermaLink="false">letterboxd-watch-2</guid>
  <letterboxd:watchedDate>2026-10-02</letterboxd:watchedDate>
  <letterboxd:rewatch>No</letterboxd:rewatch>
  <letterboxd:filmTitle>Heat</letterboxd:filmTitle>
  <letterboxd:filmYear>1995</letterboxd:filmYear>
  <letterboxd:memberLike>No</letterboxd:memberLike>
  <description><![CDATA[ <p><img src="${poster}"/></p> <p>Watched on Friday October 2, 2026.</p> ]]></description>`)}
${item(`<title>Twist, 2020 - ★★</title>
  <link>https://letterboxd.com/someone/film/twist/</link>
  <letterboxd:filmTitle>Twist &amp; Shout</letterboxd:filmTitle>
  <letterboxd:memberRating>2.0</letterboxd:memberRating>
  <description><![CDATA[ <p><img src="${poster}"/></p> <p><em>This review may contain spoilers.</em></p> <p>The butler did it.</p> ]]></description>`)}
${item(`<title>FAVOURITE FILMS</title>
  <link>https://letterboxd.com/someone/list/favourites/</link>
  <description><![CDATA[ <p>A list, not a diary entry.</p> ]]></description>`)}
${item(`<title>Elsewhere</title>
  <link>https://example.com/film/elsewhere/</link>
  <letterboxd:filmTitle>Elsewhere</letterboxd:filmTitle>
  <description><![CDATA[ <p><img src="https://example.com/poster.jpg"/></p> ]]></description>`)}
${item(`<title>Odd, 2026</title>
  <link>https://letterboxd.com/someone/film/odd/</link>
  <letterboxd:filmTitle>Odd</letterboxd:filmTitle>
  <letterboxd:filmYear>soon</letterboxd:filmYear>
  <letterboxd:memberRating>9</letterboxd:memberRating>
  <letterboxd:watchedDate>yesterday</letterboxd:watchedDate>
  <description><![CDATA[ <p><img src="https://evil.example/poster.jpg"/></p> ]]></description>`)}
</channel></rss>`;

describe("parseFeed", () => {
  const films = parseFeed(feed);

  it("keeps diary entries from Letterboxd and skips lists and other links", () => {
    expect(films.map(f => f.title)).toEqual(["Before Sunrise", "Heat", "Twist & Shout", "Odd"]);
  });

  it("reads the rating, like, rewatch, date and poster", () => {
    expect(films[0]).toMatchObject({
      id: "letterboxd-review-1",
      year: 1995,
      rating: 4.5,
      liked: true,
      rewatch: true,
      watched: "2026-10-18",
      poster,
      url: "https://letterboxd.com/someone/film/before-sunrise/",
      spoilers: false,
    });
  });

  it("turns the review into plain text, decoding entities", () => {
    expect(films[0].review).toBe("Two strangers & one night in Vienna. It's \"perfect\".\n\nSecond paragraph.");
  });

  it("treats a diary entry without a review as having none", () => {
    expect(films[1]).toMatchObject({ review: null, rating: null, liked: false, rewatch: false });
  });

  it("never shows a review marked as containing spoilers", () => {
    expect(films[2]).toMatchObject({ review: null, spoilers: true, rating: 2 });
  });

  it("drops values that don't make sense, and posters from other hosts", () => {
    expect(films[3]).toMatchObject({ year: null, rating: null, watched: null, poster: null });
  });

  it("shortens long reviews at a word", () => {
    const long = "word ".repeat(200);
    const [film] = parseFeed(item(`<link>https://letterboxd.com/a/film/b/</link><letterboxd:filmTitle>B</letterboxd:filmTitle><description><![CDATA[<p>${long}</p>]]></description>`));
    expect(film.review!.length).toBeLessThanOrEqual(421);
    expect(film.review!.endsWith("word…")).toBe(true);
  });
});

describe("helpers", () => {
  it("decodes named and numeric entities, and leaves unknown ones alone", () => {
    expect(decodeEntities("&lt;b&gt; &#8217; &#x2014; &rsquo; &bogus;")).toBe("<b> ’ — ’ &bogus;");
  });

  it("asks Letterboxd for the poster size it needs", () => {
    expect(posterAt(poster, "small")).toContain("-0-150-0-225-crop.jpg?v=abc");
    expect(posterAt(poster, "medium")).toContain("-0-460-0-690-crop.jpg");
  });
});
