import r from '@cypress/code-coverage/task';
import { defineConfig } from "cypress";
import vitePreprocessor from 'cypress-vite';


export default defineConfig({
    env: {
        codeCoverage: {
            exclude: "cypress/**/*.*",
        },
    },
    e2e: {
        setupNodeEvents(on, config) {
            on('file:preprocessor', vitePreprocessor())
            r(on, config)
            return config;
        },
    }
});
