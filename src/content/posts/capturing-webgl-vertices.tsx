import type { PostMeta } from '../../lib/posts'

export const meta: PostMeta = {
  title: 'There was no file to download, so I took the vertices instead',
  description: 'Patching gl.bufferData to pull reference mouse geometry out of a WebGL viewer that never offers a file.',
  date: '2026-08-01',
  category: 'cad',
}

export default function Post() {
  return (
    <>
      <p>
        I want to design my own lightweight mouse shell: CAD it myself, print it in MJF PA12 nylon, iterate until it
        fits my hand. But &ldquo;design a mouse shell&rdquo; is a deceptively hard first move. A mouse is one of the few
        objects you evaluate almost entirely by feel, and feel comes from millimeter-scale decisions: where the hump
        peaks, how fast the sides flare, how the front tapers into the click surfaces. Starting from a blank sketch
        plane is starting from nothing.
      </p>

      <p>
        What I actually wanted was reference geometry. Not to copy a shell, but to have dimensionally-correct shapes
        sitting in my CAD viewport so I could measure against them, section them, and understand <em>why</em> a
        shape that everyone loves is shaped that way.
      </p>

      <p>
        <a href="https://www.eloshapes.com/" target="_blank" rel="noreferrer">
          EloShapes
        </a>{' '}
        has a large database of mice with a 3D viewer. The geometry I wanted was on my screen. It just wasn&rsquo;t in a
        form I could open.
      </p>

      <h2>Step one: look for the file that doesn&rsquo;t exist</h2>

      <p>
        My first instinct was the obvious one. Open DevTools, go to the Network tab, filter by everything, click the 3D
        view, and look for anything with a recognizable extension or MIME type: <code>.glb</code>, <code>.gltf</code>,{' '}
        <code>.stl</code>, <code>.obj</code>, <code>.ply</code>.
      </p>

      <p>Nothing. No model file. A handful of opaque binary responses and a lot of JavaScript.</p>

      <p>
        That&rsquo;s where a lot of people stop. But a 3D viewer has one constraint it can&rsquo;t escape: whatever
        it&rsquo;s showing you, it had to hand to the GPU. The file format can be custom, the transport can be
        compressed, the payload can be split across a dozen responses. At the end of the pipeline there is still a
        browser API that receives plain, decoded vertex data. That API is a chokepoint, and chokepoints are where you
        set up shop.
      </p>

      <h2>The chokepoint: bufferData</h2>

      <p>
        In WebGL, every piece of geometry that ends up on screen passes through <code>gl.bufferData()</code>. Positions,
        normals, indices: all of it gets uploaded to GPU memory through that one call. It&rsquo;s a method on{' '}
        <code>WebGL2RenderingContext.prototype</code>, which means it&rsquo;s a plain JavaScript object property, which
        means I can replace it.
      </p>

      <p>The entire capture mechanism is about fifteen lines:</p>

      <pre>
        <code>{`var captured = [];
var orig = WebGL2RenderingContext.prototype.bufferData;

WebGL2RenderingContext.prototype.bufferData = function (target, data, usage) {
  if (data && data.byteLength > 10000) {
    captured.push({
      type: data.constructor.name,
      size: data.byteLength,
      data: data.slice()          // copy NOW
    });
    console.log('Captured #' + captured.length + ': ' +
                data.constructor.name + ' ' + data.byteLength + ' bytes');
  }
  return orig.apply(this, arguments);
};`}</code>
      </pre>

      <p>Three details matter more than they look like they do:</p>

      <p>
        <strong>
          <code>data.slice()</code>, not <code>data</code>.
        </strong>{' '}
        Typed arrays backing WebGL uploads are frequently reused; the viewer may write the next mesh into the same{' '}
        <code>ArrayBuffer</code> a frame later. If you store the reference, you&rsquo;re storing a window onto memory
        that will change out from under you. <code>slice()</code> copies the bytes at the moment of the call. I learned
        this the way everyone learns it.
      </p>

      <p>
        <strong>The 10&nbsp;KB threshold.</strong> A running WebGL app calls <code>bufferData</code> constantly for
        small things: UI quads, uniform blocks, instancing data, particle scratch buffers. Filtering to buffers over
        ~10&nbsp;KB throws away all the noise and keeps only things large enough to be actual mesh data.
      </p>

      <p>
        <strong>Patch before the viewer initializes.</strong> This is why the workflow is <em>click the bookmarklet,
        then click &ldquo;3D View.&rdquo;</em> If the mesh has already been uploaded, the call has already happened and
        there&rsquo;s nothing left to intercept. Reload and try again if you get the order wrong.
      </p>

      <p>
        I wrapped it in a bookmarklet with a companion <code>window.__eloCapture()</code> function that dumps everything
        collected to <code>.bin</code> files via blob download. Nothing leaves the browser; it&rsquo;s all local.
      </p>

      <p>Clicking through to the 3D view produced exactly three buffers over the threshold.</p>

      <h2>Reading three anonymous blobs</h2>

      <p>
        Three files, no schema, no documentation. But the constructor names came along for free (
        <code>Uint16Array</code>, <code>Int8Array</code>, <code>Uint32Array</code>), and that&rsquo;s most of the
        puzzle.
      </p>

      <p>
        <code>Uint32Array</code> is an index buffer. Nothing else in a mesh is 32-bit unsigned integers.
      </p>

      <p>
        <code>Int8Array</code> at four bytes per element is octahedral-or-plain normals, snorm-encoded: each component
        is <code>-127..127</code> mapping to <code>-1..1</code>, with a fourth byte for alignment padding. Dequantizing
        is <code>n / 127.0</code>, with a clamp because <code>-128 / 127</code> overshoots to <code>-1.008</code>.
      </p>

      <p>
        <code>Uint16Array</code> at eight bytes per vertex is quantized positions: X, Y, Z, and a fourth padding
        component. This is the standard trick for shrinking mesh payloads. Instead of three float32s (12 bytes), you
        snap each coordinate to a 16-bit grid across the model&rsquo;s bounding box (6 bytes, plus padding for
        alignment).
      </p>

      <p>
        The cross-check that confirmed it: the byte counts are consistent. Positions at 8 bytes/vertex and normals at 4
        bytes/vertex should be in an exact 2:1 ratio. They were. Dividing the position buffer by 8 gave a vertex count;
        dividing the index buffer by 4 gave an index count that was cleanly divisible by 3. Everything lined up as a
        single indexed triangle mesh.
      </p>

      <h2>The scale problem</h2>

      <p>
        Quantized positions are <em>unitless</em>. A value of <code>48000</code> on the X axis means &ldquo;48000/65535
        of the way across this model&rsquo;s bounding box.&rdquo; The scale factor that converts back to real units
        lives in the viewer&rsquo;s shader uniforms or its scene graph, not in the buffer I grabbed.
      </p>

      <p>
        I could have gone hunting for it. I didn&rsquo;t, because there was a much better source sitting right there:
        EloShapes publishes the real dimensions of every mouse in the spec table on the same page. Length, width, and
        height in millimeters.
      </p>

      <p>So the converter takes those three numbers as flags and solves for the scale:</p>

      <pre>
        <code>{`scale (mm per quantized unit) = real_dimension_mm / max_quantized_value_on_that_axis`}</code>
      </pre>

      <p>
        Sample the position buffer, find the maximum quantized value per axis, divide the known real-world dimension by
        it, and you have your conversion factor. The result is exactly as right as the published spec, which is exactly
        as right as I need for reference geometry.
      </p>

      <pre>
        <code>{`$ python eloshapes_to_glb.py hitscan-hyperlight ./buffers/ \\
    --length 118 --width 61 --height 38.8

Detecting scale from quantized positions...
  Quantized ranges: X=64821, Y=65535, Z=65211
  Inferred scale:   0.000603 mm/unit
  Resulting dims:   61.0 x 38.8 x 118.0 mm`}</code>
      </pre>

      <h2>Writing a GLB by hand</h2>

      <p>
        The last step is packing everything into a container something else can open. GLB is a good target: it&rsquo;s a
        single self-contained binary, and most CAD packages, slicers, and DCC tools read it.
      </p>

      <p>The format is refreshingly simple once you&rsquo;ve read the spec:</p>

      <pre>
        <code>{`[12-byte header : magic "glTF", version 2, total length]
[chunk 0 : length, type "JSON", the glTF JSON document]
[chunk 1 : length, type "BIN",  raw binary blob]`}</code>
      </pre>

      <p>
        The JSON describes the layout of the binary chunk through three layers of indirection. <code>bufferViews</code>{' '}
        slice the blob into byte ranges, <code>accessors</code> say how to interpret each range (component type, count,
        element type), and <code>meshes.primitives</code> map accessors to semantic attributes like{' '}
        <code>POSITION</code> and <code>NORMAL</code>.
      </p>

      <p>Two gotchas that will silently break your file:</p>

      <ul>
        <li>
          <strong>Every chunk must be 4-byte aligned.</strong> Pad the JSON chunk with spaces (<code>0x20</code>) and
          the binary chunk with zeros. Getting this wrong produces a file that some loaders open and others reject with
          no useful error.
        </li>
        <li>
          <strong>
            Position accessors require <code>min</code> and <code>max</code>.
          </strong>{' '}
          These aren&rsquo;t optional metadata; loaders use them for bounding-box culling, and omitting them is
          spec-invalid.
        </li>
      </ul>

      <p>
        The converter walks the position buffer, multiplies each coordinate by the scale, writes float32s, does the same
        for the normals, concatenates the untouched index buffer, and emits the header. About 60 lines of{' '}
        <code>struct.pack</code>.
      </p>

      <p>It opened in Blender on the first try. Correct proportions, correct triangle count, clean normals.</p>

      <h2>What&rsquo;s still rough</h2>

      <p>The parts I&rsquo;d fix before calling this finished:</p>

      <ul>
        <li>
          <strong>The buffer-classification fallback is wrong.</strong> The primary path reads the typed-array name out
          of the downloaded filename, which is reliable. The size-based fallback assumes the smallest file is the index
          buffer. But for a closed manifold mesh, triangle count is roughly twice vertex count, which puts the uint32
          index buffer at ~24 bytes per vertex against 8 for positions. Indices are usually the <em>largest</em> file.
          The fallback is backwards.
        </li>
        <li>
          <strong>Dequantization assumes the bounding box starts at zero.</strong> I derive scale from the maximum and
          treat the minimum as 0. If the encoder used a bbox-min offset, the whole mesh is translated. It hasn&rsquo;t
          bitten me visually, but it&rsquo;s an unverified assumption.
        </li>
        <li>
          <strong>Per-axis scale gets averaged into a uniform scale.</strong> That&rsquo;s correct if all three axes
          were quantized against a shared cube, and wrong if each axis was normalized to its own full 0&ndash;65535
          range. Since the model already stretches nearly to 65535 on all three axes with different real dimensions, the
          per-axis case is the likely one, and averaging introduces a small distortion. Solving each axis independently
          is the fix.
        </li>
        <li>
          <strong>No UVs, no materials, single mesh only.</strong> If a viewer uploads more than one mesh, you get more
          than three buffers and the classifier falls apart.
        </li>
      </ul>

      <p>
        None of that mattered for the goal. I needed dimensionally-accurate shapes to measure against in CAD, and
        that&rsquo;s what I got.
      </p>

      <h2>The transferable part</h2>

      <p>The specific bookmarklet is disposable. The pattern isn&rsquo;t:</p>

      <blockquote>
        If it renders in your browser, it exists in your browser&rsquo;s memory in a documented format. Find the API
        boundary it must cross, patch the function, copy the bytes.
      </blockquote>

      <p>
        This generalizes well beyond WebGL. Canvas 2D, Web Audio, <code>fetch</code> and <code>XMLHttpRequest</code>,{' '}
        <code>WebAssembly.instantiate</code>: any of these can be wrapped the same way when the data you want is being
        rendered but not offered. The prototype chain is writable and DevTools is a debugger. Reverse engineering a
        rendering pipeline is mostly just deciding to look one layer lower than the Network tab.
      </p>

      <h2>A note on being reasonable about this</h2>

      <p>
        These are somebody else&rsquo;s scans of somebody else&rsquo;s product designs. I extracted them for personal
        reference geometry on a mouse I&rsquo;m designing for myself, and that&rsquo;s where it ends: I&rsquo;m not
        redistributing the models, I&rsquo;m not reselling them, and I&rsquo;m not publishing a scraped mirror of the
        database. Doing any of that would be both rude and legally stupid.
      </p>

      <p>
        If you replicate this, run it on one or two shapes you actually need, don&rsquo;t hammer the site, and keep the
        output on your own machine. The technique is worth writing up. Mass-harvesting someone&rsquo;s catalog is not.
      </p>

      <hr />
    </>
  )
}
