# IDRAC Fan Control for NodeJS

This repository is designed to supercede my previous [idrac-fan-control-docker](https://github.com/alombardo4/idrac-fan-control-docker) repository, which wraps IPMITOOL with a number of shell scripts, and doesn't recover well on reboot, specifically when the filesystem persists.

## Usage

This repository can be run like an application (it assumes the `impitool` executable is available on the path) locally with `npm run start:dev` in "watch" mode.

However, the ideal way to use it is to run it as a Docker container, and it is available as `ghcr.io/alombardo4/idrac-fan-control:latest`

It requires the following environment variables to run:

| Variable | Description                          | Type   |
| -------- | ------------------------------------ | ------ |
| HOST     | hostname or IP of IDRAC              | string |
| USER     | IDRAC username                       | string |
| PASSWORD | IDRAC password                       | string |
| FANSPEED | Fan speed percentage (integer 1-100) | number |

You can run it locally like so:

`docker run -it -e HOST=192.168.0.111 -e USER=root -e PASSWORD=calvin -e FANSPEED=15 ghcr.io/alombardo4/idrac-fan-control:latest`