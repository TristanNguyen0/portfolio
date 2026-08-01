/*
 * A draft so `npm run dev` shows the finished layout with real content. Being
 * in content/drafts is what makes it a draft — it is compiled out of the
 * deployed build. Safe to delete once you've written one of your own; see
 * ../posts/_template.tsx for the copy-me version.
 */

import type { PostMeta } from '../../lib/posts'

export const meta: PostMeta = {
  title: 'Frigate kept dying at 3am',
  description: 'A week of chasing a camera stream that only dropped while I was asleep.',
  date: '2026-07-28',
  category: 'homelab',
}

export default function Post() {
  return (
    <>
      <p>
        The driveway camera dropped out every night and was back by the time I looked at it in the morning. Frigate
        logged a reconnect, the camera logged nothing at all, and the recordings just had a hole in them.
      </p>

      <h2>What the logs actually said</h2>

      <p>
        Frigate was timing out on the RTSP read, not failing to connect. That rules out the camera rebooting — it was
        still answering, just not delivering frames fast enough to keep the buffer alive.
      </p>

      <pre>
        <code>{`docker compose logs -f frigate | grep -i driveway
[2026-07-22 03:14:07] frigate.video  ERROR  : driveway: Unable to read frames from ffmpeg process.`}</code>
      </pre>

      <h3>Ruling out the network</h3>

      <p>
        The camera sits on the far side of a <code>Tailscale</code> subnet router, so that was the obvious suspect. It
        wasn&rsquo;t: a continuous ping across the same path stayed clean through the exact window the stream died.
      </p>

      <ul>
        <li>Ping held steady at ~2&nbsp;ms overnight</li>
        <li>No re-key events in the Tailscale logs</li>
        <li>Swapping to the LAN address changed nothing</li>
      </ul>

      <h2>The actual cause</h2>

      <p>
        The camera runs its infrared cut filter on a light sensor, and it flips the encoder into a different bitrate
        profile when night mode kicks in. That profile pushed more data than the MTU on the tunnel would carry without
        fragmenting, and fragmented RTP is exactly what the ffmpeg reader gives up on.
      </p>

      <blockquote>
        Every symptom pointed at the network because the trigger was environmental. It failed at 3am because that is
        when it was dark, not because of anything on a timer.
      </blockquote>

      <h3>The fix</h3>

      <p>Pinning the night profile to the same bitrate as the day profile made it go away.</p>

      <table>
        <thead>
          <tr>
            <th>Profile</th>
            <th>Before</th>
            <th>After</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Day</td>
            <td>2048 kbps</td>
            <td>2048 kbps</td>
          </tr>
          <tr>
            <td>Night</td>
            <td>4096 kbps</td>
            <td>2048 kbps</td>
          </tr>
        </tbody>
      </table>

      <hr />

      <p>Eight nights clean since. The lesson is to check what changes at the time of failure, not just what&rsquo;s on the path.</p>
    </>
  )
}
