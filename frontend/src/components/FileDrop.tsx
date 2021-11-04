import React, { Component } from 'react';
import Axios from 'axios';
import { CircularProgress, Dialog, Button, Divider } from '@mui/material';

import { DropzoneDialog } from 'material-ui-dropzone';
import AlertManager from '../manager/AlertManager';
import { getSignedUrl } from '../API';

const Colors = {
  COMPLIMENTARY: ['#D4584B', '#48639C', '#70CAD1', '#6096FD', '#101D42'],
  // COMPLIMENTARY: ['#015C92', '#2D82B5', '#FB6602', '#88CDF6', '#BCE6FF'],
  BASE: '#5568E5',
  BASE_DARK: '#0a2463',
  HIGHLIGHT: '#826BC9',
  BASE_LIGHT: '#CFDBFF',
  BASE_EXTRA_LIGHT: '#e4e8f7',
  OFF_WHITE: 'rgb(250, 250, 250)',
  GRAY: '#969696',
  LIGHT_GRAY: '#eaeaea',
  DARK_GRAY: '#2a2a2a',
  PURPLE: '#5568E5',
  PURPLE_WARM: '#826bc9',
  PURPLE_LIGHT: '#cfdbff',
  YELLOW: '#fed979',
  BLUE: '#2539bd',
  GREEN: '#37b85c',
};

type Props = {};

interface State {
  fileUploadVisible: boolean;
  filePreviewVisible: boolean;
  showUploadingDialog: boolean;

  fileLink?: string;
}

class FileDrop extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      fileUploadVisible: false,
      filePreviewVisible: false,
      showUploadingDialog: false,
    };
  }

  getFile() {
    AlertManager.message('see if this file exists or something', 'info');
  }

  componentDidMount() {
    this.getFile();

    window.addEventListener('beforeunload', (ev) => {
      if (this.state.showUploadingDialog) {
        ev.preventDefault();
        ev.returnValue =
          'We are still uploading - leaving now may result in corrupted files.';
        return ev;
      }
    });
  }

  deleteFile = async () => {
    // todo
  };

  _renderFileField() {
    const { fileLink, fileUploadVisible, filePreviewVisible } = this.state;

    return (
      <div>
        <Divider style={{ margin: '20px 0' }} />

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
          }}></div>

        {fileLink ? (
          <div>
            <Button
              onClick={() => {
                this.setState({
                  filePreviewVisible: true,
                });
              }}
              style={{ color: Colors.BASE }}>
              Watch Video
            </Button>

            <Button
              onClick={() => {
                this.deleteFile()
                  .then(() => {
                    AlertManager.message('Video deleted!', 'success');
                    this.setState({
                      fileLink: undefined,
                    });
                  })
                  .catch(() => {});
              }}
              style={{ color: Colors.BASE }}>
              Delete Video
            </Button>
          </div>
        ) : (
          <div>
            <h4
              style={{
                margin: 0,
                color: 'gray',
                marginBottom: 4,
              }}>
              Upload your files here
            </h4>
            <Button
              onClick={() => {
                this.setState({
                  fileUploadVisible: true,
                });
              }}
              style={{
                color: Colors.BASE,
                borderColor: Colors.BASE,
                borderWidth: 1,
              }}
              variant='outlined'>
              Upload
            </Button>
          </div>
        )}

        <DropzoneDialog
          filesLimit={1}
          showFileNames
          open={fileUploadVisible}
          onSave={this.handleFileUpload.bind(this)}
          //   acceptedFiles={['video/*']}
          showPreviews={true}
          maxFileSize={5000000000}
          onClose={() => this.setState({ fileUploadVisible: false })}
        />

        {filePreviewVisible && <p>file exists</p>}
      </div>
    );
  }

  // @ts-ignore
  handleFileUpload(files) {
    if (files.length === 0) {
      AlertManager.message('No files selected', 'error');
      return;
    }
    const fileName = files[0].name;
    this.setState({
      fileUploadVisible: false,
      showUploadingDialog: true,
    });
    getSignedUrl(fileName).then((signedPutUrl) => {
      const fileToUpload = files[0];

      var options = {
        headers: {
          'Content-Type': fileToUpload.type,
        },
      };
      Axios.put(signedPutUrl, fileToUpload, options)
        .then((data) => {
          console.log(data);
          this.getFile();
          this.setState({
            fileUploadVisible: false,
            showUploadingDialog: false,
          });
          AlertManager.message('Video uploaded!', 'success');
        })
        .catch((err: any) => {
          console.log(err);
          AlertManager.message(
            'Unable to upload video. Please try again.',
            'error'
          );
        });
    });
  }

  render() {
    const { showUploadingDialog } = this.state;

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {this._renderFileField()}
        <Dialog
          onClose={() => this.setState({ showUploadingDialog: false })}
          open={showUploadingDialog}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: 200,
              height: 200,
              justifyContent: 'space-around',
              alignItems: 'center',
            }}>
            <h2>Uploading</h2>
            <CircularProgress color='primary' />
            <Button
              onClick={() => this.setState({ showUploadingDialog: false })}
              style={{
                backgroundColor: 'transparent',
                color: Colors.BASE,
              }}>
              Cancel
            </Button>
          </div>
        </Dialog>
      </div>
    );
  }
}

export default FileDrop;
