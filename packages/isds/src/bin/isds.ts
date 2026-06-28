#!/usr/bin/env bun
// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { runCli } from "../cli/index.ts";

process.exitCode = await runCli();
