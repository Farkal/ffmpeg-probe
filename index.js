'use strict'

const execa = require('execa')

module.exports = async (input, options = []) => {
  const { stdout } = await execa('ffprobe', [
    '-print_format', 'json',
    '-show_error',
    ...options,
    input
  ])

  const probe = JSON.parse(stdout)
  if (probe.streams && probe.streams.length) {
    const stream = probe.streams
      .find((stream) => stream.codec_type === 'video') || probe.streams[0]

    probe.duration = Math.round(stream.duration * 1000)
    probe.width = stream.width
    probe.height = stream.height

    const fpsFraction = stream.avg_frame_rate.split('/')
    probe.fps = fpsFraction[0] / fpsFraction[1]
  } else {
    probe.duration = undefined
    probe.width = undefined
    probe.height = undefined
  }

  return probe
}
