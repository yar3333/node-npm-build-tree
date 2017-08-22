/// <reference path="../typings/globals/node/index.d.ts" />

import * as fs from "fs";
import * as path from "path";
import { CmdOptions } from "./CmdOptions";
import { Logger } from "./Logger";
import * as FsTools from "./FsTools";
import { execSync, ExecSyncOptions } from "child_process";

interface PackageFile {
    name:string;
    dependencies:{ [key:string]: string };
    scripts:{ [key:string]: string };
}

interface Tree {
    name: string;
    dir: string;
    hasBuildCommand: boolean;
    children: Tree[];
}

var options = new CmdOptions();
//options.add("target", "ES5", ["--target"], "ES3, ES5, ES6, ES2015 or Latest. Default is ES5.")
//options.add("logLevel", "warn", ["--log-level"], "Verbose level: 'none', 'warn' or 'debug'. Default is 'warn'.")
//options.addRepeatable("imports", ["--import"], "Add import for each generated file.")

options.add("script", "build", null, "npm script to execute for each module. Default is `build`.")

if (process.argv.length == 2 && process.argv[1] == "--help" || process.argv[1] == "-h" || process.argv[1] == "/?")
{
    console.log("The tool to walk a dependency tree (by reading `package.json` files)");
    console.log("from deep to top and run `npm run <script>` command for each module.");
    console.log("Process only modules which referenced by a 'file:' prefix in dependencies.");
    console.log("");
    console.log("Usage: npm-build-tree [ <npm-script-to-execute> ]");
    console.log("Where:");
    console.log(options.getHelpMessage());
    process.exit(1);
}

var params = options.parse(process.argv.slice(1));

var script = params.get("script");

var tree = makeTree(".");
if (tree) buildTree(tree);

//////////////////////////////////////////////////////////////////////////////////////////////

function makeTree(baseDir) : Tree
{
    if (!fs.existsSync(baseDir + "/package.json")) return null;
    
    var json : PackageFile = JSON.parse(fs.readFileSync(baseDir + "/package.json", 'utf8'));

    return <Tree>{
        name: json.name,
        dir: baseDir,
        hasBuildCommand: json.scripts && !!json.scripts["build"],
        children: json.dependencies 
            ? Object.keys(json.dependencies).filter(k => json.dependencies[k].startsWith("file:")).map(k => makeTree(json.dependencies[k].substring("file:".length))).filter(x => x)
            : []
    };
}

function buildTree(tree:Tree)
{
    for (var x of tree.children) buildTree(x);
    
    systemSync("npm run " + script, { cwd:tree.dir, maxBuffer:16*1024*1024 });
}

function systemSync(cmd:string, options): string
{
    console.log(options.cwd + "> " + cmd);
    
    try
    {
        return execSync(cmd, options).toString();
    }
    catch (e)
    {
        console.log(e.message);
        console.log(e.stdout);
        console.log(e.stderr);
        
        process.exit(e.status);
    }
}
