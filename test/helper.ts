function onUncaught(err: string): void {
    console.error(err);
    process.exit(1);
}

process.on('unhandledRejection', onUncaught);
