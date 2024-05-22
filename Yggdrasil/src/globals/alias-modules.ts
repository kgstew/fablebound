import moduleAlias from 'module-alias'
import path from 'path'

const topLevelModules = ['api', 'app', 'domain', 'spi', 'utils']

const aliases = topLevelModules.reduce<Record<string, string>>(
    (acc, alias) => ({
        ...acc,
        [alias]: path.resolve(`${__dirname}/../${alias}`),
    }),
    {}
)

moduleAlias.addAliases(aliases)
