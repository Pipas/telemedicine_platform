
#  Real Time Optimizations for a Web-based Telemedicine Platform


## Demo

A demo version of the developed project, with values being generated in the client, can be found [here](https://paulocorreia.me/WebGLGraphing/).

## Abstract

At-home health monitoring devices can prove to be of great value both for patients and medical professionals in the process of making medical consultations more convenient and available. Although not a new field of study, recent advances in technology and infrastructure have made Telemedicine, the act of providing healthcare at a distance, more reliable and capable than ever before. Having numerous advantages over its traditional counterpart, this digital approach to medicine might be crucial to provide access to care to those who are most deprived of it.

While there is research being done in the area, the vast majority of consumer-available solutions still have many disadvantages, like excessive price, the lack of key features and inflexibility or the reliance on proprietary software and specific operating systems, which affect their overall adoption.

The present work will continue the team effort at INEGI and FEUP of building an affordable, robust and open prototype for telemedicine use. This device is capable of real-time Electromyography (EMG) monitoring and transmission so that a medical expert can analyse the sampled data in a remote consultation scenario.

The analysis of this data is made in a web-application context via a modern web browser, where the data from the device is received and displayed. The core of the work presented focuses on optimizing this platform so it is as performant and reliable as other available solutions, with the advantage of being easily accessible through the internet.

The solution entails a custom written real-time charting library for the web capable of displaying thousands of values per second while maintaining performance. This is achieved through the usage of WebGL, a JavaScript API for rendering high-performance interactive 3D and 2D graphics, that provides a way to execute shader code in a device's graphics processing unit (GPU). It also takes advantage of other modern browser features, like WebSockets, IndexedDB and Web Workers, to provide all the necessary tools to analyse the dataset collected by the device.

The developed software achieves a significantly better performance than other available graphing solutions on the web and provides a feature full analysis platform that is available on any device with an internet connection.

## Full Document

The full disseration document can be found [here](docs/Dissertation.pdf).

## Credits

**Author:** Paulo Renato A. Correia

**Supervisor:** Daniel Sá Pina

**Co-supervisor:** Renato Manuel Natal Jorge
