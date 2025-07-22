{{/*
Expand the name of the chart.
*/}}
{{- define "homechef.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "homechef.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "homechef.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "homechef.labels" -}}
helm.sh/chart: {{ include "homechef.chart" . }}
{{ include "homechef.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "homechef.selectorLabels" -}}
app.kubernetes.io/name: {{ include "homechef.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "homechef.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "homechef.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Generate service labels for a specific service
*/}}
{{- define "homechef.serviceLabels" -}}
{{ include "homechef.labels" . }}
app.kubernetes.io/component: {{ .serviceName }}
{{- end }}

{{/*
Generate selector labels for a specific service
*/}}
{{- define "homechef.serviceSelectorLabels" -}}
{{ include "homechef.selectorLabels" . }}
app.kubernetes.io/component: {{ .serviceName }}
{{- end }}

{{/*
Generate image name
*/}}
{{- define "homechef.image" -}}
{{- $registry := .Values.global.imageRegistry | default .Values.common.image.registry -}}
{{- $repository := .image.repository -}}
{{- $tag := .image.tag | default .Values.common.image.tag -}}
{{- printf "%s/%s:%s" $registry $repository $tag -}}
{{- end }}

{{/*
Generate database URL
*/}}
{{- define "homechef.databaseUrl" -}}
{{- if .Values.postgresql.enabled -}}
postgres://{{ .Values.postgresql.auth.username }}:{{ .Values.postgresql.auth.password }}@{{ include "homechef.fullname" . }}-postgresql:5432/{{ .Values.postgresql.auth.database }}?sslmode=disable
{{- else -}}
{{ .Values.externalDatabase.url }}
{{- end -}}
{{- end }}

{{/*
Generate Redis URL
*/}}
{{- define "homechef.redisUrl" -}}
{{- if .Values.redis.enabled -}}
redis://{{ include "homechef.fullname" . }}-redis-master:6379
{{- else -}}
{{ .Values.externalRedis.url }}
{{- end -}}
{{- end }}