/**
 * Copyright 2017-2020 Rex Lee
 *
 * THIS FILE IS PART OF  PROJECT
 * ALL COPYRIGHT RESERVED
 *
 * Created by duguying on 2018/7/23.
 */

import XLog from "./XLog";

interface Window {
    XLog: any
}

interface Global {
    XLog: any
}

let globalObj:any = typeof window !== 'undefined' ? window : global;

globalObj.XLog = XLog;