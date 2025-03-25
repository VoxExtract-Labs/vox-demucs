// ai-assist/build-prompt.ts

// Required dependencies:
// bun add @inquirer/prompts
// bun add directory-tree

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { input } from '@inquirer/prompts';
import directoryTree from 'directory-tree';

(async () => {
    // Paths
    const packageJsonPath = join(process.cwd(), 'package.json');
    const readmePath = join(process.cwd(), 'README.md');
    const guidePath = join(process.cwd(), 'ai-assist/npm-package-prompt.md');
    const templatePath = join(process.cwd(), 'ai-assist/prompt-template.txt');

    // Read files
    let packageJson: unknown = {};
    let readme = '';
    let guide = '';
    let template = '';
    let treeStructure = '(tree generation failed)';

    try {
        packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    } catch (error) {
        console.error(`❌ Failed to read or parse package.json: ${(error as Error).message}`);
    }

    try {
        readme = readFileSync(readmePath, 'utf8');
    } catch (error) {
        console.error(`❌ Failed to read README.md: ${(error as Error).message}`);
    }

    try {
        guide = readFileSync(guidePath, 'utf8');
    } catch (error) {
        console.error(`❌ Failed to read npm-package-prompt.md: ${(error as Error).message}`);
    }

    try {
        template = readFileSync(templatePath, 'utf8');
    } catch (error) {
        console.error('❌ Failed to read prompt-template.txt. This file is required.');
        process.exit(1);
    }

    try {
        const tree = directoryTree(process.cwd(), {
            exclude: /node_modules|container_data|venv|logs|env|.idea|.DS_Store|.git/,
        });

        const renderTree = (node: directoryTree.DirectoryTree, prefix = ''): string => {
            let result = `${prefix}${node.name}`;
            if (node.children && node.children.length > 0) {
                for (const child of node.children) {
                    result += `\n${renderTree(child, `${prefix}  `)}`;
                }
            }
            return result;
        };

        treeStructure = renderTree(tree);
    } catch (error) {
        console.error(`⚠️ Failed to generate directory tree: ${(error as Error).message}`);
    }

    const projectName = await input({ message: 'What is the name of your project on npm?' });
    const npmOrg = await input({ message: 'What is the name of the npm organization (leave blank if none)?' });
    const additionalInfo = await input({ message: 'Any additional context ChatGPT should know?' });

    const fullName = npmOrg ? `@${npmOrg}/${projectName}` : projectName;

    const finalPrompt = template
        .replace('<project_name>', fullName)
        .replace('<package_json>', JSON.stringify(packageJson, null, 2))
        .replace('<readme>', readme || '(no README found)')
        .replace('<tree>', treeStructure)
        .replace('<additional_info>', additionalInfo || '(none)')
        .replace('<publishing_guide>', guide || '(missing guide)');

    console.log('\n✅ Copy this prompt to ChatGPT:');
    console.log('='.repeat(60));
    console.log(finalPrompt);
    console.log('='.repeat(60));
})().catch((error) => {
    console.error(`❌ Unhandled error: ${(error as Error).message}`);
});
