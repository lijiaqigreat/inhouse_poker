# protoc --twirp_js_out=src/ --js_out=import_style=commonjs,binary:src --proto_path=../personal_server/protobuf/ ../personal_server/protobuf/command.proto
protoc --twirp_typescript_out=library=pbjs:src/ --proto_path=../personal_server/protobuf/ ../personal_server/protobuf/command.proto

# cd src/
# files=`ls -1 *.ts`

# for x in $files
# do
#     mv $x "`basename $files .ts`.js"
# done


