import propertiesReader from 'properties-reader';
export const get = (variableName) => {
    var properties = propertiesReader('./serverVariables.ini');
    return properties.get(variableName);
}