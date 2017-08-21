/// <reference path="../typings/globals/node/index.d.ts" />

import * as fs from "fs";
import * as path from "path";
import { CmdOptions } from "./CmdOptions";
import { Logger } from "./Logger";
import * as FsTools from "./FsTools";
import { execSync } from "child_process";

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

/*var options = new CmdOptions();
options.add("target", "ES5", ["--target"], "ES3, ES5, ES6, ES2015 or Latest. Default is ES5.")
options.add("logLevel", "warn", ["--log-level"], "Verbose level: 'none', 'warn' or 'debug'. Default is 'warn'.")
options.addRepeatable("imports", ["--import"], "Add import for each generated file.")*/

if (process.argv.length == 2 && process.argv[1] == "--help" || process.argv[1] == "-h" || process.argv[1] == "/?")
{
    console.log("The tool to walk a dependency tree (by reading `package.json` files)");
    console.log("from deep to top and run `npm build` command for each changed module.");
    console.log("Process only modules which referenced by a 'file:' prefix in dependencies.");
    console.log("Usage: npm-build-tree");
    process.exit(1);
}

//var params = options.parse(process.argv.slice(2));

/*
let filePaths : Array<string> = params.get("filePaths");
for (var i = 0; i < filePaths.length; i++)
{
    if (fs.statSync(filePaths[i]).isDirectory())
    {
        var allFiles = [];
        FsTools.walkSync(filePaths[i], (start, dirs, files) => allFiles = allFiles.concat(files.filter(x => x.endsWith(".d.ts")).map(x => start + "/" + x)));
        var after = filePaths.slice(i + 1);
        filePaths = filePaths.slice(0, i).concat(allFiles).concat(after);
        i += allFiles.length - 1;
    }
}*/



var tree = makeTree(".");
buildTree(tree);

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

function detectModuleSelfChanged(dir:string): boolean
{
    return true;
}

function detectModuleSourcesLastModifiedMoment(dir:string) : Date
{
    
}

function buildTree(tree:Tree) : Date
{
    var date = tree.children.map(x => buildTree(x)).reduce((prev, cur) => , null)
    
    execSync
}

console.log("Count: " + count);
