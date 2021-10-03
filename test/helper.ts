function onUncaught(err: string) {
    console.error(err);
    process.exit(1);
}

process.on('unhandledRejection', onUncaught);
